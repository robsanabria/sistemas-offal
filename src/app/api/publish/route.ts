import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function POST(request: Request) {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('Missing Redis env vars for /api/publish');
    return NextResponse.json({ error: 'Missing Redis env vars' }, { status: 500 });
  }

  const redis = new Redis({ url, token });

  const { roomId, type, payload } = await request.json();
  if (!roomId || !type) {
    return NextResponse.json({ error: 'Falta roomId o type' }, { status: 400 });
  }

  const event = JSON.stringify({ type, payload, ts: Date.now() });

  try {
    // Agregar evento a la lista de la sala
    await redis.rpush(`events:${roomId}`, event);

    // Limitar la lista a los últimos 500 eventos para no crecer infinitamente
    await redis.ltrim(`events:${roomId}`, -500, -1);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to publish event:', err);
    return NextResponse.json({ error: 'Failed to publish event' }, { status: 500 });
  }
}
