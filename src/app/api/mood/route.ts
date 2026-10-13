import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { claveSegura, texto } from '@/lib/validate'

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

// name viene del cliente y se usa como clave del objeto guardado: acotamos
// cuántas personas distintas puede haber y cuánto puede medir cada estado.
const MAX_PERSONAS = 50
const MAX_MOOD_CHARS = 16

export async function GET() {
    try {
        let moods = await kv.get<Record<string, string>>('office:moods')
        if (!moods) {
            moods = DEFAULT_MOODS
            await kv.set('office:moods', moods)
        }
        return NextResponse.json({ moods })
    } catch (error) {
        console.error('mood: falló la lectura', error)
        return NextResponse.json({ moods: DEFAULT_MOODS, error: 'KV failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const name = claveSegura(body?.name, 32)
        const mood = texto(body?.mood, MAX_MOOD_CHARS)

        if (!name || !mood) {
            return NextResponse.json({ error: 'Hacen falta name y mood válidos' }, { status: 400 })
        }

        const guardados = await kv.get<Record<string, string>>('office:moods')
        const moods = { ...(guardados ?? DEFAULT_MOODS) }

        if (!(name in moods) && Object.keys(moods).length >= MAX_PERSONAS) {
            return NextResponse.json({ error: 'Demasiadas personas en el tablero' }, { status: 409 })
        }

        moods[name] = mood

        await kv.set('office:moods', moods)
        return NextResponse.json({ moods })
    } catch (error) {
        console.error('mood: falló la escritura', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
