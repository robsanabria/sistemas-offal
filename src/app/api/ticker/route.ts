import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

export type TickerEvent = {
    id: string;
    message: string;
    timestamp: number;
}

export async function GET() {
    try {
        const events = await kv.get<TickerEvent[]>(KEYS.GLOBAL_TICKER) || []
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { message } = body

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 })
        }

        const newEvent: TickerEvent = {
            id: Math.random().toString(36).substr(2, 9),
            message,
            timestamp: Date.now()
        }

        const currentEvents = await kv.get<TickerEvent[]>(KEYS.GLOBAL_TICKER) || []
        
        // Add to front, keep max 15
        const updatedEvents = [newEvent, ...currentEvents].slice(0, 15)
        
        await kv.set(KEYS.GLOBAL_TICKER, updatedEvents)
        
        return NextResponse.json(updatedEvents)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
