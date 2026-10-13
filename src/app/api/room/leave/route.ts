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
    const playerId = validarId(body?.playerId);
    if (!roomId || !playerId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    meta.players = meta.players ?? [];
    meta.scores = meta.scores ?? {};

    const idx = meta.players.findIndex((p: { id: string }) => p.id === playerId);
    const removed = idx >= 0 ? meta.players.splice(idx, 1)[0] : null;
    if (meta.scores && meta.scores[playerId] !== undefined) delete meta.scores[playerId];

    // If the leaving player was the drawer, pick a new drawer or clear
    if (meta.drawerId === playerId) {
      const players = meta.players ?? [];
      if (players.length > 0) {
        meta.drawerId = players[0].id;
        meta.currentDrawerIndex = 0;
        meta.word = meta.word ?? randomWord();
        await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });
        await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_leave', payload: { id: playerId, name: removed?.name ?? null }, ts: Date.now() }));
        await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));
      } else {
        // no players left
        meta.drawerId = null;
        meta.currentDrawerIndex = 0;
        meta.word = null;
        await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });
        await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_leave', payload: { id: playerId, name: removed?.name ?? null }, ts: Date.now() }));
      }
    } else {
      // normal leave
      await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_leave', payload: { id: playerId, name: removed?.name ?? null }, ts: Date.now() }));
    }

    // No devolvemos meta crudo: incluía la palabra secreta de la ronda en curso.
    const safeMeta = { ...meta };
    delete safeMeta.word;
    return NextResponse.json({ ok: true, meta: safeMeta });
  } catch (err) {
    console.error('room/leave error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
