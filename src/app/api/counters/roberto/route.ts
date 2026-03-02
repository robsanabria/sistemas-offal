import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

export async function GET() {
    try {
        const daysStored = await kv.get<number>(KEYS.ROBERTO_ABSENCE) ?? 0
        const last = await kv.get<string>(KEYS.ROBERTO_LAST) ?? null

        const today = new Date().toISOString().slice(0, 10)

        let days = daysStored
        if (!last) {
            await kv.set(KEYS.ROBERTO_LAST, today)
        } else {
            const diffMs = new Date(today).getTime() - new Date(last).getTime()
            const diffDays = Math.floor(diffMs / 86400000)
            if (diffDays > 0) {
                days = await kv.incrby(KEYS.ROBERTO_ABSENCE, diffDays)
                await kv.set(KEYS.ROBERTO_LAST, today)
            }
        }

        return NextResponse.json({ days })
    } catch (error) {
        return NextResponse.json({ days: 0, error: 'KV Connection failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { delta, reset } = body;
        const today = new Date().toISOString().slice(0, 10)

        if (reset) {
            await kv.set(KEYS.ROBERTO_ABSENCE, 0)
            await kv.set(KEYS.ROBERTO_LAST, today)
            return NextResponse.json({ days: 0 })
        }

        const newDays = await kv.incrby(KEYS.ROBERTO_ABSENCE, delta || 0)
        await kv.set(KEYS.ROBERTO_LAST, today)
        return NextResponse.json({ days: newDays })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
