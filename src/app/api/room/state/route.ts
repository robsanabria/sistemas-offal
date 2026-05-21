import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    // Don't leak drawer secret word to everyone: only include word if requester provides ?revealTo=<playerId> and matches drawer
    const revealTo = searchParams.get('revealTo');
    const safeMeta = { ...meta };
    if (!revealTo || revealTo !== meta.drawerId) {
      // hide secret word
      delete safeMeta.word;
    }

    return NextResponse.json({ ok: true, meta: safeMeta });
  } catch (err: any) {
    console.error('room/state error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
