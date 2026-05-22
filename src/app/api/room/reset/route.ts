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
    // reset scores
    meta.scores = {};

    // pick a drawer: prefer current drawer, otherwise first player
    const players = meta.players ?? [];
    if (!meta.drawerId && players.length > 0) {
      meta.drawerId = players[0].id;
      meta.currentDrawerIndex = 0;
    } else if (players.length > 0 && !players.find((p: any) => p.id === meta.drawerId)) {
      meta.drawerId = players[0].id;
      meta.currentDrawerIndex = 0;
    }

    // set new secret word for the next round
    meta.word = randomWord();

    await redis.set(`room:${roomId}`, JSON.stringify(meta));

    // publish events: clear canvas, announce reset/new round
    await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'clear', payload: null, ts: Date.now() }));
    await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'room_reset', payload: { drawerId: meta.drawerId }, ts: Date.now() }));
    await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));

    return NextResponse.json({ ok: true, meta });
  } catch (err: any) {
    console.error('room/reset error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
