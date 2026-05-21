import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { randomWord } from '@/lib/wordPool';

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
  const playerId = body?.playerId as string | undefined;
  const playerName = body?.name as string | undefined;
  const playerAvatar = body?.avatar as string | undefined;

  // Create a new lobby (room)
  const roomId = uuidv4();
  const drawerId = playerId ?? uuidv4();
  const word = randomWord();

  try {
    // Build initial meta
    const meta: any = { word, drawerId, players: [], scores: {} };
    if (playerId && playerName) {
      meta.players.push({ id: playerId, name: playerName, avatar: playerAvatar ?? null });
      meta.scores[playerId] = 0;
      // notify join event
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'player_join', payload: { id: playerId, name: playerName, avatar: playerAvatar ?? null }, ts: Date.now() }));
    }

    // Store room meta (word and drawer) in Redis for later reference
    await redis.set(`room:${roomId}`, JSON.stringify(meta));

    // Return the room details (word only to drawer client)
    return NextResponse.json({ roomId, drawerId, word });
  } catch (err) {
    console.error('Failed to create room in Redis:', err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
