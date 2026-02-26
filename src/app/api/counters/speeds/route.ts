import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

export async function GET() {
    try {
        const count = await kv.get<number>(KEYS.SPEED_COUNTER) ?? 0
        return NextResponse.json({ count })
    } catch (error) {
        return NextResponse.json({ count: 0, error: 'KV Connection failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { delta } = await req.json()
        const newCount = await kv.incrby(KEYS.SPEED_COUNTER, delta)
        return NextResponse.json({ count: newCount })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
