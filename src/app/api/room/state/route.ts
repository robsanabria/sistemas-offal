import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { TTL_SALA_SEG } from '@/lib/kv';
import { id as validarId } from '@/lib/validate';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = validarId(searchParams.get('roomId'));
    if (!roomId) return NextResponse.json({ error: 'Falta roomId o es inválido' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    // If room has no players, reset computed state so first join starts fresh.
    // Solo se escribe si de verdad quedó algo para limpiar: este GET lo llama
    // cada cliente cada 2s, y antes escribía en Redis en cada tick.
    meta.players = meta.players ?? [];
    if (meta.players.length === 0) {
      const hayQueLimpiar =
        meta.drawerId !== undefined ||
        meta.word !== undefined ||
        meta.currentDrawerIndex !== undefined ||
        Object.keys(meta.scores ?? {}).length > 0;

      if (hayQueLimpiar) {
        meta.scores = {};
        delete meta.drawerId;
        delete meta.currentDrawerIndex;
        delete meta.word;
        await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });
      }
    }

    // Don't leak drawer secret word to everyone: only include word if requester provides ?revealTo=<playerId> and matches drawer
    const revealTo = searchParams.get('revealTo');
    const safeMeta = { ...meta };
    if (!revealTo || revealTo !== meta.drawerId) {
      // hide secret word
      delete safeMeta.word;
    }

    return NextResponse.json({ ok: true, meta: safeMeta });
  } catch (err) {
    console.error('room/state error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
