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
    // Leer eventos desde la posición del cursor
    const events = await redis.lrange(`events:${roomId}`, cursor, -1);

    return NextResponse.json({
      events: events.map((e) => (typeof e === 'string' ? JSON.parse(e) : e)),
      nextCursor: cursor + events.length,
    });
  } catch (err) {
    console.error('Failed to poll events:', err);
    return NextResponse.json({ error: 'Failed to poll events' }, { status: 500 });
  }
}
