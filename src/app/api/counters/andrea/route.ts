import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'
import { entero } from '@/lib/validate'

const MAX_DELTA = 1_000

export async function GET() {
    try {
        const daysStored = await kv.get<number>(KEYS.ANDREA_ABSENCE) ?? 0
        const last = await kv.get<string>(KEYS.ANDREA_LAST) ?? null

        const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

        let days = daysStored
        if (!last) {
            // first time - set last to today
            await kv.set(KEYS.ANDREA_LAST, today)
        } else {
            const diffMs = new Date(today).getTime() - new Date(last).getTime()
            const diffDays = Math.floor(diffMs / 86400000)
            if (diffDays > 0) {
                days = await kv.incrby(KEYS.ANDREA_ABSENCE, diffDays)
                await kv.set(KEYS.ANDREA_LAST, today)
            }
        }

        return NextResponse.json({ days })
    } catch (error) {
        console.error('counters/andrea: falló la lectura', error)
        return NextResponse.json({ days: 0, error: 'KV Connection failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { reset } = body;
        const today = new Date().toISOString().slice(0, 10)

        if (reset) {
            await kv.set(KEYS.ANDREA_ABSENCE, 0)
            await kv.set(KEYS.ANDREA_LAST, today)
            return NextResponse.json({ days: 0 })
        }

        // delta iba crudo a INCRBY: un string o un número fuera de rango dejaba
        // el contador en un valor del que no se vuelve.
        const delta = entero(body?.delta, -MAX_DELTA, MAX_DELTA)
        if (delta === null) {
            return NextResponse.json({ error: 'delta tiene que ser un número' }, { status: 400 })
        }

        const newDays = await kv.incrby(KEYS.ANDREA_ABSENCE, delta)
        // update last seen so automatic increments start from today
        await kv.set(KEYS.ANDREA_LAST, today)
        return NextResponse.json({ days: newDays })
    } catch (error) {
        console.error('counters/andrea: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
