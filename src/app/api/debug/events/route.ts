import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const redis = getRedis();
    // return the full list of events for inspection
    const entries = await redis.lrange(`events:${roomId}`, 0, -1);
    const events = (entries ?? []).map((e: any) => {
      try {
        return typeof e === 'string' ? JSON.parse(e) : e;
      } catch {
        return e;
      }
    });

    return NextResponse.json({ ok: true, count: events.length, events });
  } catch (err: any) {
    console.error('/api/debug/events error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
