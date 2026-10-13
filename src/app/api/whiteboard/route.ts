import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const WHITEBOARD_KEY = 'office:whiteboard:content'

// La pizarra se le sirve a todos los que abren el tablero, así que el tope de
// tamaño no es cosmético: sin él, un solo POST puede meter megabytes en Redis y
// después hacerlos bajar a cada cliente en cada poll.
const MAX_CHARS = 20_000

export async function GET() {
    try {
        const guardado = await kv.get(WHITEBOARD_KEY)
        const content = typeof guardado === 'string' ? guardado : ''
        return NextResponse.json({ content })
    } catch (error) {
        console.error('whiteboard: falló la lectura', error)
        return NextResponse.json({ content: '' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const { content } = body

        if (typeof content !== 'string') {
            return NextResponse.json({ error: 'content tiene que ser texto' }, { status: 400 })
        }
        if (content.length > MAX_CHARS) {
            return NextResponse.json(
                { error: `La pizarra admite hasta ${MAX_CHARS} caracteres` },
                { status: 413 },
            )
        }

        await kv.set(WHITEBOARD_KEY, content)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('whiteboard: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
