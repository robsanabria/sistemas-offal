import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';

export async function POST(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/publish');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const body = await request.json();
  const { roomId, type, payload, playerId } = body;
  if (!roomId || !type) {
    return NextResponse.json({ error: 'Falta roomId o type' }, { status: 400 });
  }
  try {
    // helper: ensure events_seq initialized and push an event with seq
    const seqKey = `events_seq:${roomId}`;
    const ensureSeq = async () => {
      const exists = await redis.get(seqKey);
      if (!exists) {
        const len = await redis.llen(`events:${roomId}`);
        await redis.set(seqKey, len ?? 0);
      }
    };

    const pushEvent = async (obj: any) => {
      await ensureSeq();
      const seq = await redis.incr(seqKey);
      const toPush = { seq, ...obj };
      await redis.rpush(`events:${roomId}`, JSON.stringify(toPush));
      await redis.ltrim(`events:${roomId}`, -500, -1);
      return toPush;
    };

    // Special handling for guesses: enforce drawer can't guess and score correct answers
    if (type === 'guess') {
      if (!playerId) return NextResponse.json({ error: 'Missing playerId for guess' }, { status: 400 });

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

      // publish the guess event so others see it (con autor)
      await pushEvent({ type, payload: { playerId, name: guesserName, text: String(payload ?? '') }, ts: Date.now() });

      // if guess matches word, increment score and emit correct_guess + new_round events
      const guessStr = String(payload ?? '').trim();
      const wordStr = String(meta.word ?? '').trim();
      if (guessStr && wordStr && guessStr.toLowerCase() === wordStr.toLowerCase()) {
        meta.scores = meta.scores ?? {};
        meta.scores[playerId] = (meta.scores[playerId] ?? 0) + 1;

        // Determine next drawer by advancing currentDrawerIndex (sequential rotation)
        const players = meta.players ?? [];
        const playerIds = players.map((p: any) => p.id).filter((id: string) => !!id);
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
        await redis.set(`room:${roomId}`, JSON.stringify(meta));

        // emit correct_guess (reporting who guessed what) and then new_round
        await pushEvent({ type: 'correct_guess', payload: { playerId, name: guesserName, word: guessedWord }, ts: Date.now() });
        await pushEvent({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() });
      }

      return NextResponse.json({ ok: true });
    }

    // generic event publish (stroke, clear, new_round etc.)
    await pushEvent({ type, payload, ts: Date.now() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to publish event:', err);
    return NextResponse.json({ error: 'Failed to publish event' }, { status: 500 });
  }
}
