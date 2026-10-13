import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';
import { MAX_EVENTOS_EN_LISTA, TTL_SALA_SEG } from '@/lib/kv';
import { excedeTamanio, id as validarId, texto } from '@/lib/validate';

// Tipos de evento que aceptamos del cliente. Los de resultado (correct_guess,
// new_round, room_reset) los emite el server: si se aceptaran del cliente,
// cualquiera podría anunciar que acertó y rotar el dibujante.
const TIPOS_DEL_CLIENTE = new Set(['stroke', 'clear', 'guess']);

const MAX_EVENTOS_POR_REQUEST = 60;
const MAX_BYTES_PAYLOAD = 4_000;
const MAX_CHARS_GUESS = 120;

type EventoEntrante = { type: string; payload?: unknown };

export async function POST(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/publish');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const body = await request.json().catch(() => ({}));
  const { type, payload, playerId: playerIdCrudo } = body;

  // roomId se interpola en la key de Redis: va por allowlist, no crudo.
  const roomId = validarId(body?.roomId);
  if (!roomId) {
    return NextResponse.json({ error: 'Falta roomId o es inválido' }, { status: 400 });
  }

  const playerId = playerIdCrudo === undefined ? null : validarId(playerIdCrudo);

  // Dos formatos: un evento suelto (legacy) o un lote. El lote existe porque el
  // dibujante genera un stroke por mousemove: mandarlos de a uno eran ~60
  // requests/s por persona y ~4 comandos de Redis cada una.
  const lote: unknown = body?.events;
  const entrantes: EventoEntrante[] = Array.isArray(lote)
    ? lote.slice(0, MAX_EVENTOS_POR_REQUEST) as EventoEntrante[]
    : [{ type, payload }];

  if (entrantes.length === 0) {
    return NextResponse.json({ error: 'No hay eventos para publicar' }, { status: 400 });
  }

  const eventsKey = `events:${roomId}`;
  const seqKey = `events_seq:${roomId}`;

  try {
    /** Empuja N eventos con una sola asignación de seq y un solo pipeline. */
    const pushEvents = async (objs: Record<string, unknown>[]) => {
      const ultimoSeq = await redis.incrby(seqKey, objs.length);
      const primerSeq = ultimoSeq - objs.length + 1;
      const items = objs.map((obj, i) => JSON.stringify({ seq: primerSeq + i, ...obj }));

      const pipeline = redis.pipeline();
      pipeline.rpush(eventsKey, ...items);
      pipeline.ltrim(eventsKey, -MAX_EVENTOS_EN_LISTA, -1);
      // TTL deslizante: la sala vive mientras se use y se limpia sola si no.
      pipeline.expire(eventsKey, TTL_SALA_SEG);
      pipeline.expire(seqKey, TTL_SALA_SEG);
      await pipeline.exec();
    };

    // Special handling for guesses: enforce drawer can't guess and score correct answers
    if (entrantes.length === 1 && entrantes[0]?.type === 'guess') {
      if (!playerId) return NextResponse.json({ error: 'Missing playerId for guess' }, { status: 400 });

      const intento = texto(entrantes[0].payload, MAX_CHARS_GUESS);
      if (!intento) return NextResponse.json({ error: 'Guess vacío' }, { status: 400 });

      // fetch room meta to validate
      const metaRaw = await redis.get(`room:${roomId}`);
      const meta = metaRaw ? (typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw) : null;
      if (!meta) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

      if (meta.drawerId === playerId) {
        return NextResponse.json({ error: 'Drawer cannot submit guesses' }, { status: 403 });
      }

      // resolver el nombre del jugador para mostrarlo en el chat
      const guesser = (meta.players ?? []).find((p: { id: string; name?: string }) => p.id === playerId);
      const guesserName = guesser?.name ?? 'Alguien';

      const aEmitir: Record<string, unknown>[] = [
        { type: 'guess', payload: { playerId, name: guesserName, text: intento }, ts: Date.now() },
      ];

      // if guess matches word, increment score and emit correct_guess + new_round events
      const wordStr = String(meta.word ?? '').trim();
      if (wordStr && intento.toLowerCase() === wordStr.toLowerCase()) {
        meta.scores = meta.scores ?? {};
        meta.scores[playerId] = (meta.scores[playerId] ?? 0) + 1;

        // Determine next drawer by advancing currentDrawerIndex (sequential rotation)
        const players = meta.players ?? [];
        const playerIds = players.map((p: { id: string }) => p.id).filter((playerIdDeLista: string) => !!playerIdDeLista);
        if (!meta.currentDrawerIndex && meta.currentDrawerIndex !== 0) meta.currentDrawerIndex = playerIds.indexOf(meta.drawerId ?? '') ?? 0;
        const currentIndex = meta.currentDrawerIndex ?? playerIds.indexOf(meta.drawerId ?? '');
        const nextIndex = (Number(currentIndex) + 1) % Math.max(1, playerIds.length);
        const newDrawerId = playerIds.length > 0 ? playerIds[nextIndex] : meta.drawerId;

        // store the guessed word to report in the event BEFORE changing meta.word
        const guessedWord = meta.word;

        // update meta with new drawer and new secret word
        meta.drawerId = newDrawerId;
        meta.currentDrawerIndex = nextIndex;
        meta.word = randomWord();

        // persist meta update
        await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });

        aEmitir.push({ type: 'correct_guess', payload: { playerId, name: guesserName, word: guessedWord }, ts: Date.now() });
        aEmitir.push({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() });
      }

      await pushEvents(aEmitir);
      return NextResponse.json({ ok: true });
    }

    // Eventos genéricos (stroke / clear). Se validan de a uno y se descartan los
    // que no correspondan en vez de rechazar todo el lote.
    const aEmitir: Record<string, unknown>[] = [];
    for (const evento of entrantes) {
      if (!evento || typeof evento.type !== 'string') continue;
      if (!TIPOS_DEL_CLIENTE.has(evento.type) || evento.type === 'guess') continue;
      if (excedeTamanio(evento.payload, MAX_BYTES_PAYLOAD)) continue;
      aEmitir.push({ type: evento.type, payload: evento.payload ?? null, ts: Date.now() });
    }

    if (aEmitir.length === 0) {
      return NextResponse.json({ error: 'Ningún evento válido en el lote' }, { status: 400 });
    }

    await pushEvents(aEmitir);
    return NextResponse.json({ ok: true, publicados: aEmitir.length });
  } catch (err) {
    console.error('Failed to publish event:', err);
    return NextResponse.json({ error: 'Failed to publish event' }, { status: 500 });
  }
}
