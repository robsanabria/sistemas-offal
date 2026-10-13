import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { MAX_EVENTOS_EN_LISTA } from '@/lib/kv';
import { entero, id as validarId } from '@/lib/validate';

export async function GET(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/poll');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const { searchParams } = new URL(request.url);
  const roomId = validarId(searchParams.get('roomId'));
  const cursor = entero(searchParams.get('cursor') ?? 0, 0, Number.MAX_SAFE_INTEGER) ?? 0;

  if (!roomId) {
    return NextResponse.json({ error: 'Falta roomId o es inválido' }, { status: 400 });
  }

  const eventsKey = `events:${roomId}`;

  try {
    // Este endpoint lo llama cada cliente una vez por segundo. Antes leía TODA
    // la lista (hasta 500 eventos) en cada llamada, incluso cuando no había nada
    // nuevo. Ahora el seq dice cuántos eventos faltan y solo se leen esos: el
    // caso normal ("no pasó nada") son 1 comando y una respuesta vacía.
    const currentSeq = Number((await redis.get(`events_seq:${roomId}`)) ?? 0);

    if (currentSeq > 0) {
      if (cursor >= currentSeq) {
        return NextResponse.json({ events: [], nextCursor: currentSeq });
      }

      const faltan = Math.min(currentSeq - cursor, MAX_EVENTOS_EN_LISTA);
      const entries = await redis.lrange(eventsKey, -faltan, -1);
      const parsed = (entries ?? []).map(parsear);
      const filtered = parsed.filter((evento) => (evento?.seq ?? 0) > cursor);

      return NextResponse.json({ events: filtered, nextCursor: currentSeq });
    }

    // Sala vieja: eventos sin `seq`. Se trata el cursor como índice.
    const entries = await redis.lrange(eventsKey, 0, -1);
    const parsed = (entries ?? []).map(parsear);
    const sliced = parsed.slice(cursor);
    return NextResponse.json({ events: sliced, nextCursor: cursor + sliced.length });
  } catch (err) {
    console.error('Failed to poll events:', err);
    return NextResponse.json({ error: 'Failed to poll events' }, { status: 500 });
  }
}

function parsear(entrada: unknown) {
  try {
    return typeof entrada === 'string' ? JSON.parse(entrada) : entrada;
  } catch {
    return entrada;
  }
}
