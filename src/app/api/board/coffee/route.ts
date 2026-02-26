import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'

const DEFAULT_TEAM = ['Roberto', 'Nicolas', 'Andrea', 'Juan', 'Tobias', 'Matias', 'Norber', 'Eze']

export async function GET() {
    try {
        let maker = await kv.get<string>(KEYS.COFFEE_MAKER)
        if (!maker) {
            maker = DEFAULT_TEAM[0]
            await kv.set(KEYS.COFFEE_MAKER, maker)
        }
        return NextResponse.json({ maker })
    } catch (error) {
        return NextResponse.json({ maker: 'Error', error: 'KV failed' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        let newMaker: string
        const body = await request.json().catch(() => ({}))
        if (body && typeof body.force === 'string' && DEFAULT_TEAM.includes(body.force)) {
            newMaker = body.force
        } else {
            // Pick a random person from the team
            const randomIndex = Math.floor(Math.random() * DEFAULT_TEAM.length)
            newMaker = DEFAULT_TEAM[randomIndex]
        }

        await kv.set(KEYS.COFFEE_MAKER, newMaker)
        return NextResponse.json({ maker: newMaker })
    } catch (error) {
        return NextResponse.json({ error: 'Randomization failed' }, { status: 500 })
    }
}
