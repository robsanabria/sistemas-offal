import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { entero, texto } from '@/lib/validate'

const MORSE_MESSAGES_KEY = 'office:morse:messages'

// In-memory fallback for local development when Vercel KV is not configured
type MorseGuardado = {
    id: string
    sender: string
    text: string
    morse: string
    wpm: number
    frequency: number
    isManual: boolean
    pulses: { type: 'tone' | 'silence'; duration: number }[]
    timestamp: string
}

let localFallbackMessages: MorseGuardado[] = []

const MAX_PULSOS = 2_000

// El body llegaba con `...message` crudo: cualquiera podía guardar un objeto
// arbitrario (y de cualquier tamaño) que después se le sirve a todo el feed.
// Acá se arma el mensaje campo por campo y se descarta lo que no esperamos.
function normalizar(message: unknown): MorseGuardado | null {
    if (!message || typeof message !== 'object') return null
    const m = message as Record<string, unknown>

    const sender = texto(m.sender, 32)
    const text = texto(m.text, 500)
    const morse = texto(m.morse, 2_000)
    const wpm = entero(m.wpm, 1, 100)
    const frequency = entero(m.frequency, 100, 3_000)

    if (!sender || !text || !morse || wpm === null || frequency === null) return null

    const pulsosCrudos = Array.isArray(m.pulses) ? m.pulses.slice(0, MAX_PULSOS) : []
    const pulses = pulsosCrudos.flatMap((p) => {
        if (!p || typeof p !== 'object') return []
        const pulso = p as Record<string, unknown>
        const type: 'tone' | 'silence' | null =
            pulso.type === 'tone' ? 'tone' : pulso.type === 'silence' ? 'silence' : null
        const duration = entero(pulso.duration, 0, 60_000)
        return type && duration !== null ? [{ type, duration }] : []
    })

    return {
        id: crypto.randomUUID(),
        sender,
        text,
        morse,
        wpm,
        frequency,
        isManual: m.isManual === true,
        pulses,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
}

export async function GET() {
    try {
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            return NextResponse.json({ messages: localFallbackMessages })
        }
        const messages = await kv.get(MORSE_MESSAGES_KEY) || []
        return NextResponse.json({ messages })
    } catch (error) {
        console.warn('Vercel KV failed or not configured, using local fallback:', error)
        return NextResponse.json({ messages: localFallbackMessages })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const newMessage = normalizar(body?.message)

        if (!newMessage) {
            return NextResponse.json({ error: 'Message payload inválido' }, { status: 400 })
        }

        // Fallback if environment variables are not present
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            localFallbackMessages = [newMessage, ...localFallbackMessages].slice(0, 20)
            return NextResponse.json({ success: true, messages: localFallbackMessages })
        }

        const guardados = await kv.get<MorseGuardado[]>(MORSE_MESSAGES_KEY) || []
        const current = Array.isArray(guardados) ? guardados : []
        const updated = [newMessage, ...current].slice(0, 20)

        await kv.set(MORSE_MESSAGES_KEY, updated)
        return NextResponse.json({ success: true, messages: updated })
    } catch (error) {
        console.warn('Vercel KV save failed, falling back to local memory:', error)
        return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }
}
