import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'node:crypto';
import { id as validarId } from '@/lib/validate';

// Endpoint de inspección: volcaba la lista completa de eventos de cualquier sala
// a cualquiera que supiera la URL. Ahora pide un secreto compartido por header.
// Si DEBUG_TOKEN no está configurado, el endpoint queda apagado (404) en vez de
// abierto: preferimos que falle a que filtre.
//
//   curl -H "x-debug-token: <DEBUG_TOKEN>" ".../api/debug/events?roomId=public"

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Missing Redis env vars');
  return new Redis({ url, token });
};

function tokenValido(recibido: string | null, esperado: string): boolean {
  if (!recibido) return false
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  // timingSafeEqual exige mismo largo, así que se compara el largo aparte.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const esperado = process.env.DEBUG_TOKEN;
  if (!esperado) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  if (!tokenValido(request.headers.get('x-debug-token'), esperado)) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const roomId = validarId(searchParams.get('roomId'));
    if (!roomId) return NextResponse.json({ error: 'Falta roomId o es inválido' }, { status: 400 });

    const redis = getRedis();
    // return the full list of events for inspection
    const entries = await redis.lrange(`events:${roomId}`, 0, -1);
    const events = (entries ?? []).map((entrada: unknown) => {
      try {
        return typeof entrada === 'string' ? JSON.parse(entrada) : entrada;
      } catch {
        return entrada;
      }
    });

    return NextResponse.json({ ok: true, count: events.length, events });
  } catch (err) {
    console.error('/api/debug/events error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
