import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { randomWord } from '@/lib/wordPool';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  // Create a new lobby (room)
  const roomId = uuidv4();
  const drawerId = uuidv4();
  const word = randomWord();

  // Store room meta (word and drawer) in Redis for later reference
  await redis.set(`room:${roomId}`, JSON.stringify({ word, drawerId }));

  // Return the room details (word only to drawer client)
  return NextResponse.json({ roomId, drawerId, word });
}
