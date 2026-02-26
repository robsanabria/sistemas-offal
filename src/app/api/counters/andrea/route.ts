import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

export async function GET() {
    try {
        const days = await kv.get<number>(KEYS.ANDREA_ABSENCE) ?? 0
        return NextResponse.json({ days })
    } catch (error) {
        return NextResponse.json({ days: 0, error: 'KV Connection failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { delta, reset } = body;

        if (reset) {
            await kv.set(KEYS.ANDREA_ABSENCE, 0)
            return NextResponse.json({ days: 0 })
        }

        const newDays = await kv.incrby(KEYS.ANDREA_ABSENCE, delta || 0)
        return NextResponse.json({ days: newDays })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
