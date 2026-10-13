import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';
import { TTL_SALA_SEG } from '@/lib/kv';
import { id as validarId } from '@/lib/validate';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomId = validarId(body?.roomId);
    if (!roomId) return NextResponse.json({ error: 'Falta roomId o es inválido' }, { status: 400 });

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
    } else if (players.length > 0 && !players.find((p: { id: string }) => p.id === meta.drawerId)) {
      meta.drawerId = players[0].id;
      meta.currentDrawerIndex = 0;
    }

    // set new secret word for the next round
    meta.word = randomWord();

    await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });

    // publish events: clear canvas, announce reset/new round
    const pipeline = redis.pipeline();
    pipeline.rpush(`events:${roomId}`, JSON.stringify({ type: 'clear', payload: null, ts: Date.now() }));
    pipeline.rpush(`events:${roomId}`, JSON.stringify({ type: 'room_reset', payload: { drawerId: meta.drawerId }, ts: Date.now() }));
    pipeline.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));
    pipeline.expire(`events:${roomId}`, TTL_SALA_SEG);
    await pipeline.exec();

    // No devolvemos meta crudo: incluía la palabra secreta nueva.
    const safeMeta = { ...meta };
    delete safeMeta.word;
    return NextResponse.json({ ok: true, meta: safeMeta });
  } catch (err) {
    console.error('room/reset error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
