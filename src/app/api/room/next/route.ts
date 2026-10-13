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
    if (meta.players.length === 0) return NextResponse.json({ error: 'No players in room' }, { status: 400 });

    meta.currentDrawerIndex = (meta.currentDrawerIndex ?? 0) + 1;
    meta.currentDrawerIndex = meta.currentDrawerIndex % meta.players.length;
    const drawer = meta.players[meta.currentDrawerIndex];
    meta.drawerId = drawer.id;
    meta.word = randomWord();

    await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });

    // push event that a new round started (do not include the secret word in event)
    await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));

    // Solo se devuelve quién dibuja. La palabra la pide el dibujante por
    // /api/room/state?revealTo=<su id>: antes volvía acá, así que cualquiera que
    // llamara a este endpoint se la llevaba.
    return NextResponse.json({ ok: true, drawerId: meta.drawerId });
  } catch (err) {
    console.error('room/next error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
