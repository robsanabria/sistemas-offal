import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const KARMA_KEY = 'office:karma:points'

export async function GET() {
    try {
        const points = await kv.get(KARMA_KEY) || {}
        return NextResponse.json(points)
    } catch (error) {
        return NextResponse.json({}, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { memberId, category, delta } = await req.json()
        const current = await kv.get<Record<string, number>>(KARMA_KEY) || {}

        const key = `${memberId}_${category}`
        const newVal = (current[key] || 0) + delta
        const updated = { ...current, [key]: newVal }

        await kv.set(KARMA_KEY, updated)
        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
