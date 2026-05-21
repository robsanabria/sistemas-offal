import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    meta.players = meta.players ?? [];
    if (meta.players.length === 0) return NextResponse.json({ error: 'No players in room' }, { status: 400 });

    meta.currentDrawerIndex = (meta.currentDrawerIndex ?? 0) + 1;
    meta.currentDrawerIndex = meta.currentDrawerIndex % meta.players.length;
    const drawer = meta.players[meta.currentDrawerIndex];
    meta.drawerId = drawer.id;
    meta.word = randomWord();

    await redis.set(`room:${roomId}`, JSON.stringify(meta));

    // push event that a new round started (do not include the secret word in event)
    await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));

    // return drawer and secret word to caller (caller should be server or drawer)
    return NextResponse.json({ ok: true, drawerId: meta.drawerId, word: meta.word });
  } catch (err: any) {
    console.error('room/next error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
