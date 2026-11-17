// "Días sin faltar": por persona se guarda un punto de partida { base, desde } y
// los días se calculan al leer, sumando los días hábiles transcurridos. Así el
// GET no escribe nada y el contador avanza solo.

export const PERSONAS = [
    { id: 'tobias', nombre: 'Tobias' },
    { id: 'andrea', nombre: 'Andrea' },
] as const

export type PersonaId = (typeof PERSONAS)[number]['id']

export interface Racha {
    base: number   // días sin faltar que tenía en `desde`
    desde: string  // YYYY-MM-DD (hora Argentina)
}

// Valores iniciales, hasta que alguien toque el contador
export const RACHA_INICIAL: Record<PersonaId, Racha> = {
    tobias: { base: 7, desde: '2026-11-17' },
    andrea: { base: 0, desde: '2026-11-17' },
}

export const MAX_DIAS = 9_999

// Feriados nacionales que no suman como día trabajado (cargar los de 2027 cuando salgan)
const FERIADOS = new Set(['2026-11-23', '2026-12-08', '2026-12-25', '2027-01-01'])

/** Fecha de hoy en Argentina (UTC-3, sin horario de verano). */
export function hoyAR(): string {
    return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** Días hábiles (lun-vie, sin feriados) posteriores a `desde` y hasta `hasta` inclusive. */
export function diasHabilesEntre(desde: string, hasta: string): number {
    const fin = new Date(`${hasta}T00:00:00Z`).getTime()
    let dias = 0
    const d = new Date(`${desde}T00:00:00Z`)
    // tope defensivo: nunca recorrer más de ~27 años aunque `desde` venga roto
    for (let i = 0; i < MAX_DIAS; i++) {
        d.setUTCDate(d.getUTCDate() + 1)
        if (d.getTime() > fin) break
        const dow = d.getUTCDay()
        if (dow !== 0 && dow !== 6 && !FERIADOS.has(d.toISOString().slice(0, 10))) dias++
    }
    return dias
}

export function diasSinFaltar(racha: Racha, hoy = hoyAR()): number {
    return Math.min(MAX_DIAS, racha.base + diasHabilesEntre(racha.desde, hoy))
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/

/** Valida lo que vuelve de Redis; si no tiene la forma esperada, usa el inicial. */
export function rachaValida(valor: unknown, porDefecto: Racha): Racha {
    if (!valor || typeof valor !== 'object') return porDefecto
    const { base, desde } = valor as Partial<Racha>
    if (typeof base !== 'number' || !Number.isInteger(base) || base < 0 || base > MAX_DIAS) return porDefecto
    if (typeof desde !== 'string' || !FECHA_ISO.test(desde)) return porDefecto
    return { base, desde }
}
