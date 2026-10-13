import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';
import { TTL_SALA_SEG } from '@/lib/kv';
import { id as validarId, texto } from '@/lib/validate';

const MAX_JUGADORES = 20;

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
    const name = texto(body?.name, 32);
    const avatar = texto(body?.avatar, 64);

    if (!roomId || !playerId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const redis = getRedis();
    const metaRaw = await redis.get(`room:${roomId}`);
    if (!metaRaw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;

    meta.players = meta.players ?? [];
    meta.scores = meta.scores ?? {};

    const exists = meta.players.find((p: { id: string }) => p.id === playerId);
    if (!exists) {
      if (meta.players.length >= MAX_JUGADORES) {
        return NextResponse.json({ error: 'La sala está llena' }, { status: 409 });
      }

      const wasEmpty = !meta.players || meta.players.length === 0;
      meta.players.push({ id: playerId, name, avatar: avatar ?? null });
      meta.scores[playerId] = 0;

      // If this is the first player in the room, make them the drawer and ensure a word
      if (wasEmpty) {
        meta.drawerId = playerId;
        meta.currentDrawerIndex = 0;
        meta.word = meta.word ?? randomWord();
      }

      await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });
      // notify others
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_join', payload: { id: playerId, name, avatar: avatar ?? null }, ts: Date.now() }));
    }

    // No filtrar la palabra secreta: solo se incluye si quien pide es el dibujante actual
    const safeMeta = { ...meta };
    if (playerId !== meta.drawerId) delete safeMeta.word;
    return NextResponse.json({ ok: true, meta: safeMeta });
  } catch (err) {
    console.error('room/join error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
