import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

const DEFAULT_MOODS: Record<string, string> = {
    'Roberto': '😎',
    'Nicolas': '💼',
    'Andrea': '☕',
    'Juan': '🏍️',
    'Tobias': '🤔',
    'Matias': '💻',
    'Norber': '👔',
    'Eze': '🚀'
}

export async function GET() {
    try {
        let moods = await kv.get<Record<string, string>>('office:moods')
        if (!moods) {
            moods = DEFAULT_MOODS
            await kv.set('office:moods', moods)
        }
        return NextResponse.json({ moods })
    } catch (error) {
        return NextResponse.json({ moods: DEFAULT_MOODS, error: 'KV failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { name, mood } = await req.json()
        let moods = await kv.get<Record<string, string>>('office:moods') || DEFAULT_MOODS

        moods[name] = mood

        await kv.set('office:moods', moods)
        return NextResponse.json({ moods })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
