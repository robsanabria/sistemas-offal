import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { claveSegura, entero } from '@/lib/validate'

const KARMA_KEY = 'office:karma:points'

// Tope de claves distintas: memberId y category vienen del cliente, así que sin
// esto cualquiera puede hacer crecer el objeto para siempre.
const MAX_CLAVES = 500
const MAX_DELTA = 100

export async function GET() {
    try {
        const points = await kv.get(KARMA_KEY) || {}
        return NextResponse.json(points)
    } catch (error) {
        console.error('karma: falló la lectura', error)
        return NextResponse.json({}, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const memberId = claveSegura(body?.memberId, 32)
        const category = claveSegura(body?.category, 32)
        const delta = entero(body?.delta, -MAX_DELTA, MAX_DELTA)

        if (!memberId || !category || delta === null) {
            return NextResponse.json(
                { error: 'Hacen falta memberId, category y delta válidos' },
                { status: 400 },
            )
        }

        const current = await kv.get<Record<string, number>>(KARMA_KEY) || {}
        const key = `${memberId}_${category}`

        if (!(key in current) && Object.keys(current).length >= MAX_CLAVES) {
            return NextResponse.json({ error: 'Demasiadas categorías cargadas' }, { status: 409 })
        }

        const actual = typeof current[key] === 'number' ? current[key] : 0
        const updated = { ...current, [key]: actual + delta }

        await kv.set(KARMA_KEY, updated)
        return NextResponse.json(updated)
    } catch (error) {
        console.error('karma: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
