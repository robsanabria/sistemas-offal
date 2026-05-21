import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const cursor = parseInt(searchParams.get('cursor') ?? '0', 10);

  if (!roomId) {
    return NextResponse.json({ error: 'Falta roomId' }, { status: 400 });
  }

  // Leer eventos desde la posición del cursor
  const events = await redis.lrange(`events:${roomId}`, cursor, -1);

  return NextResponse.json({
    events: events.map((e) => (typeof e === 'string' ? JSON.parse(e) : e)),
    nextCursor: cursor + events.length,
  });
}
