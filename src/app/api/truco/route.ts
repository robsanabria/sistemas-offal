import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const TRUCO_KEY = 'office:truco:score'

export async function GET() {
    try {
        const score = await kv.get(TRUCO_KEY) || { nosotros: 0, ellos: 0 }
        return NextResponse.json(score)
    } catch (error) {
        return NextResponse.json({ nosotros: 0, ellos: 0 }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nosotros, ellos, reset } = body

        let newScore = { nosotros: 0, ellos: 0 }

        if (!reset) {
            const current = await kv.get<{ nosotros: number, ellos: number }>(TRUCO_KEY) || { nosotros: 0, ellos: 0 }
            newScore = {
                nosotros: nosotros !== undefined ? nosotros : current.nosotros,
                ellos: ellos !== undefined ? ellos : current.ellos
            }
        }

        await kv.set(TRUCO_KEY, newScore)
        return NextResponse.json(newScore)
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
