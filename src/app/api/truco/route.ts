import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { entero } from '@/lib/validate'

const TRUCO_KEY = 'office:truco:score'

// Un partido de truco va a 30; dejamos margen pero no infinito.
const MAX_PUNTOS = 60

export async function GET() {
    try {
        const score = await kv.get(TRUCO_KEY) || { nosotros: 0, ellos: 0 }
        return NextResponse.json(score)
    } catch (error) {
        console.error('truco: falló la lectura', error)
        return NextResponse.json({ nosotros: 0, ellos: 0 }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const { nosotros, ellos, reset } = body

        let newScore = { nosotros: 0, ellos: 0 }

        if (!reset) {
            const guardado = await kv.get<{ nosotros: number, ellos: number }>(TRUCO_KEY)
            const current = guardado ?? { nosotros: 0, ellos: 0 }

            const nuevoNosotros = nosotros !== undefined ? entero(nosotros, 0, MAX_PUNTOS) : current.nosotros
            const nuevoEllos = ellos !== undefined ? entero(ellos, 0, MAX_PUNTOS) : current.ellos

            if (nuevoNosotros === null || nuevoEllos === null) {
                return NextResponse.json({ error: 'Puntajes inválidos' }, { status: 400 })
            }

            newScore = { nosotros: nuevoNosotros, ellos: nuevoEllos }
        }

        await kv.set(TRUCO_KEY, newScore)
        return NextResponse.json(newScore)
    } catch (error) {
        console.error('truco: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
