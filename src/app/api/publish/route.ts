import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  const { roomId, type, payload } = await request.json();
  if (!roomId || !type) {
    return NextResponse.json({ error: 'Falta roomId o type' }, { status: 400 });
  }

  const event = JSON.stringify({ type, payload, ts: Date.now() });

  // Agregar evento a la lista de la sala
  await redis.rpush(`events:${roomId}`, event);

  // Limitar la lista a los últimos 500 eventos para no crecer infinitamente
  await redis.ltrim(`events:${roomId}`, -500, -1);

  return NextResponse.json({ ok: true });
}
