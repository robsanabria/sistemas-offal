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
    const { roomId, playerId, name, avatar } = await request.json();
    if (!roomId || !playerId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    meta.players = meta.players ?? [];
    meta.scores = meta.scores ?? {};

    const exists = meta.players.find((p: any) => p.id === playerId);
    if (!exists) {
      meta.players.push({ id: playerId, name, avatar: avatar ?? null });
      meta.scores[playerId] = 0;
      await redis.set(`room:${roomId}`, JSON.stringify(meta));
      // notify others
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_join', payload: { id: playerId, name, avatar: avatar ?? null }, ts: Date.now() }));
    }

    return NextResponse.json({ ok: true, meta });
  } catch (err: any) {
    console.error('room/join error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
