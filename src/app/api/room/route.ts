import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { randomWord } from '@/lib/wordPool';
import { TTL_SALA_SEG } from '@/lib/kv';
import { id as validarId, texto } from '@/lib/validate';

const MAX_JUGADORES = 20;

export async function POST(request: Request) {
  // Validate Upstash env vars exist (fail fast with helpful message)
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error('Missing Redis env vars for /api/room');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  // accept optional playerId/name in request to make creator the drawer
  const body = await request.json().catch(() => ({}));
  const requestedRoomId = validarId(body?.roomId);
  const playerId = validarId(body?.playerId);
  const playerName = texto(body?.name, 32);
  const playerAvatar = texto(body?.avatar, 64);

  if (body?.roomId !== undefined && !requestedRoomId) {
    return NextResponse.json({ error: 'roomId inválido' }, { status: 400 });
  }

  // allow creating or reusing a specific room id (e.g. 'public')
  const roomId = requestedRoomId ?? uuidv4();

  try {
    // if a room with this id already exists, return it (optionally add creator as player)
    const existingRaw = await redis.get(`room:${roomId}`);
    if (existingRaw) {
      const existingMeta = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
      // if caller provided player info and is not already present, add them
      if (playerId && playerName) {
        existingMeta.players = existingMeta.players ?? [];
        existingMeta.scores = existingMeta.scores ?? {};
        const exists = existingMeta.players.find((p: { id: string }) => p.id === playerId);
        if (!exists) {
          if (existingMeta.players.length >= MAX_JUGADORES) {
            return NextResponse.json({ error: 'La sala está llena' }, { status: 409 });
          }
          existingMeta.players.push({ id: playerId, name: playerName, avatar: playerAvatar ?? null });
          existingMeta.scores[playerId] = 0;
          await redis.set(`room:${roomId}`, JSON.stringify(existingMeta), { ex: TTL_SALA_SEG });
          await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_join', payload: { id: playerId, name: playerName, avatar: playerAvatar ?? null }, ts: Date.now() }));
        }
      }

      // Do not leak the secret word unless the requester is the drawer
      const resp: { roomId: string; drawerId?: string; word?: string } = { roomId, drawerId: existingMeta.drawerId };
      if (playerId && playerId === existingMeta.drawerId) resp.word = existingMeta.word;
      return NextResponse.json(resp);
    }

    // Create a new lobby (room)
    const drawerId = playerId ?? uuidv4();
    const word = randomWord();

    // Build initial meta
    const meta: Record<string, unknown> = { word, drawerId, players: [], scores: {} };
    if (playerId && playerName) {
      (meta.players as unknown[]).push({ id: playerId, name: playerName, avatar: playerAvatar ?? null });
      (meta.scores as Record<string, number>)[playerId] = 0;
      // notify join event
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_join', payload: { id: playerId, name: playerName, avatar: playerAvatar ?? null }, ts: Date.now() }));
    }

    // Store room meta (word and drawer) in Redis for later reference.
    // Con TTL: antes cada sala creada (una por uuid) quedaba para siempre.
    await redis.set(`room:${roomId}`, JSON.stringify(meta), { ex: TTL_SALA_SEG });

    // Return the room details (word only to drawer client)
    return NextResponse.json({ roomId, drawerId, word });
  } catch (err) {
    console.error('Failed to create room in Redis:', err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
