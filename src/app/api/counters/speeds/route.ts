import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'
import { entero } from '@/lib/validate'

// delta llegaba sin validar directo a INCRBY: un string o un número gigante
// rompía el contador (o lo dejaba en un valor del que no se vuelve).
const MAX_DELTA = 1_000

export async function GET() {
    try {
        const count = await kv.get<number>(KEYS.SPEED_COUNTER) ?? 0
        return NextResponse.json({ count })
    } catch (error) {
        console.error('speeds: falló la lectura', error)
        return NextResponse.json({ count: 0, error: 'KV Connection failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const delta = entero(body?.delta, -MAX_DELTA, MAX_DELTA)

        if (delta === null) {
            return NextResponse.json({ error: 'delta tiene que ser un número' }, { status: 400 })
        }

        const newCount = await kv.incrby(KEYS.SPEED_COUNTER, delta)
        return NextResponse.json({ count: newCount })
    } catch (error) {
        console.error('speeds: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
