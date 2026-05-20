import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  const { roomId, type, payload } = await request.json();
  if (!roomId || !type) {
    return NextResponse.json({ error: 'Missing roomId or type' }, { status: 400 });
  }
  await redis.publish(`pictonary:${roomId}`, JSON.stringify({ type, payload }));
  return NextResponse.json({ ok: true });
}
