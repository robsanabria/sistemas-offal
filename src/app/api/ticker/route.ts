import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'
import { texto } from '@/lib/validate'

export type TickerEvent = {
    id: string;
    message: string;
    timestamp: number;
}

const MAX_MENSAJE = 280

export async function GET() {
    try {
        const events = await kv.get<TickerEvent[]>(KEYS.GLOBAL_TICKER) || []
        return NextResponse.json(Array.isArray(events) ? events : [])
    } catch (error) {
        console.error('ticker: falló la lectura', error)
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const message = texto(body?.message, MAX_MENSAJE)

        if (!message) {
            return NextResponse.json(
                { error: `Hace falta un message de hasta ${MAX_MENSAJE} caracteres` },
                { status: 400 },
            )
        }

        const newEvent: TickerEvent = {
            id: crypto.randomUUID(),
            message,
            timestamp: Date.now()
        }

        const guardados = await kv.get<TickerEvent[]>(KEYS.GLOBAL_TICKER) || []
        const currentEvents = Array.isArray(guardados) ? guardados : []

        // Add to front, keep max 15
        const updatedEvents = [newEvent, ...currentEvents].slice(0, 15)

        await kv.set(KEYS.GLOBAL_TICKER, updatedEvents)

        return NextResponse.json(updatedEvents)
    } catch (error) {
        console.error('ticker: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
