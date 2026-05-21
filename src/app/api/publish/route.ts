import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { randomWord } from '@/lib/wordPool';

export async function POST(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/publish');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const body = await request.json();
  const { roomId, type, payload, playerId } = body;
  if (!roomId || !type) {
    return NextResponse.json({ error: 'Falta roomId o type' }, { status: 400 });
  }
  try {
    // Special handling for guesses: enforce drawer can't guess and score correct answers
    if (type === 'guess') {
      if (!playerId) return NextResponse.json({ error: 'Missing playerId for guess' }, { status: 400 });

      // fetch room meta to validate
      const metaRaw = await redis.get(`room:${roomId}`);
      const meta = metaRaw ? (typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw) : null;
      if (!meta) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

      if (meta.drawerId === playerId) {
        return NextResponse.json({ error: 'Drawer cannot submit guesses' }, { status: 403 });
      }

      // publish the guess event so others see it
      await redis.rpush(`events:${roomId}`, JSON.stringify({ type, payload, ts: Date.now() }));

      // if guess matches word, increment score and emit correct_guess event
      const guessStr = String(payload ?? '').trim().toLowerCase();
      const wordStr = String(meta.word ?? '').trim().toLowerCase();
      if (guessStr && wordStr && guessStr === wordStr) {
        meta.scores = meta.scores ?? {};
        meta.scores[playerId] = (meta.scores[playerId] ?? 0) + 1;
        // persist score update
        await redis.set(`room:${roomId}`, JSON.stringify(meta));
        await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'correct_guess', payload: { playerId, word: meta.word }, ts: Date.now() }));

        // Rotate drawer at random (exclude current drawer if possible)
        const players = meta.players ?? [];
        const playerIds = players.map((p: any) => p.id).filter((id: string) => !!id);
        const candidates = playerIds.filter((id: string) => id !== meta.drawerId);
        let newDrawerId = meta.drawerId;
        if (candidates.length > 0) {
          newDrawerId = candidates[Math.floor(Math.random() * candidates.length)];
        }
        meta.drawerId = newDrawerId;
        // choose a new secret word for the new drawer
        meta.word = randomWord();
        await redis.set(`room:${roomId}`, JSON.stringify(meta));
        // announce new round (do not reveal the word in the event)
        await redis.rpush(`events:${roomId}`, JSON.stringify({ type: 'new_round', payload: { drawerId: meta.drawerId }, ts: Date.now() }));
      }

      // trim events list
      await redis.ltrim(`events:${roomId}`, -500, -1);
      return NextResponse.json({ ok: true });
    }

    // generic event publish (stroke, clear, new_round etc.)
    const event = JSON.stringify({ type, payload, ts: Date.now() });
    await redis.rpush(`events:${roomId}`, event);
    await redis.ltrim(`events:${roomId}`, -500, -1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to publish event:', err);
    return NextResponse.json({ error: 'Failed to publish event' }, { status: 500 });
  }
}
