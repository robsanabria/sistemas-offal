import { NextResponse } from 'next/server'
import { kv, KEYS } from '@/lib/kv'
import { entero } from '@/lib/validate'
import {
    PERSONAS, rachaInicial, MAX_DIAS, hoyAR, diasSinFaltar, rachaValida,
    type PersonaId, type Racha,
} from '@/lib/asistencia'

export const dynamic = 'force-dynamic'

async function leerTodo() {
    const guardado = (await kv.hgetall<Record<string, unknown>>(KEYS.ASISTENCIA)) ?? {}
    const hoy = hoyAR()
    return PERSONAS.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        dias: diasSinFaltar(rachaValida(guardado[p.id], rachaInicial(p.id)), hoy),
    }))
}

export async function GET() {
    try {
        return NextResponse.json({ personas: await leerTodo() })
    } catch (error) {
        console.error('asistencia: falló la lectura', error)
        return NextResponse.json({ error: 'No se pudo leer la asistencia' }, { status: 500 })
    }
}

// Endpoint anónimo que escribe: solo personas de la lista y solo dos operaciones
// acotadas (marcar falta = volver a 0, o corregir el número dentro de un rango).
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const persona = PERSONAS.find((p) => p.id === body?.persona)?.id as PersonaId | undefined
        if (!persona) {
            return NextResponse.json({ error: 'persona desconocida' }, { status: 400 })
        }

        let base: number | null
        if (body?.accion === 'falto') {
            base = 0
        } else {
            base = body?.dias === undefined || body?.dias === null ? null : entero(body.dias, 0, MAX_DIAS)
        }
        if (base === null) {
            return NextResponse.json({ error: 'hay que mandar accion "falto" o dias' }, { status: 400 })
        }

        const racha: Racha = { base, desde: hoyAR() }
        await kv.hset(KEYS.ASISTENCIA, { [persona]: racha })
        return NextResponse.json({ personas: await leerTodo() })
    } catch (error) {
        console.error('asistencia: falló la escritura', error)
        return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
    }
}
