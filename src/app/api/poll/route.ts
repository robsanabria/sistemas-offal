import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/poll');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const cursor = parseInt(searchParams.get('cursor') ?? '0', 10);

  if (!roomId) {
    return NextResponse.json({ error: 'Falta roomId' }, { status: 400 });
  }

  try {
    // Leer todos los eventos y soportar dos modos de cursor:
    // - Si los eventos tienen `seq`, tratamos el cursor como la última seq conocida y devolvemos eventos con seq > cursor.
    // - Si no hay seq (legacy), tratamos el cursor como índice y devolvemos desde ese índice.
    const entries = await redis.lrange(`events:${roomId}`, 0, -1);
    const parsed = (entries ?? []).map((e) => {
      try {
        return typeof e === 'string' ? JSON.parse(e) : e;
      } catch {
        return e;
      }
    });

    const hasSeq = parsed.some((p) => typeof p?.seq === 'number');

    if (hasSeq) {
      const currentSeqRaw = await redis.get(`events_seq:${roomId}`);
      const currentSeq = Number(currentSeqRaw ?? 0);
      const filtered = parsed.filter((p) => (p.seq ?? 0) > cursor);
      return NextResponse.json({ events: filtered, nextCursor: currentSeq });
    } else {
      const sliced = parsed.slice(cursor);
      return NextResponse.json({ events: sliced, nextCursor: cursor + sliced.length });
    }
  } catch (err) {
    console.error('Failed to poll events:', err);
    return NextResponse.json({ error: 'Failed to poll events' }, { status: 500 });
  }
}
