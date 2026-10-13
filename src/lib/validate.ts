// Helpers de validación de payloads. La idea es que ninguna ruta guarde en Redis
// algo que venga crudo del cliente: sin tope de tamaño, un solo POST puede dejar
// la base inutilizable (y se la sirve después a todos los que abren el tablero).

/** Texto acotado. Devuelve null si no es string o si quedó vacío. */
export function texto(valor: unknown, maxLen: number): string | null {
    if (typeof valor !== 'string') return null
    const limpio = valor.slice(0, maxLen).trim()
    return limpio.length > 0 ? limpio : null
}

/** Entero finito dentro de un rango. Devuelve null si no es un número usable. */
export function entero(valor: unknown, min: number, max: number): number | null {
    const n = typeof valor === 'number' ? valor : Number(valor)
    if (!Number.isFinite(n)) return null
    return Math.min(max, Math.max(min, Math.trunc(n)))
}

/** Id simple (sala, jugador, carta). Allowlist explícita, sin separadores de key. */
const ID_VALIDO = /^[A-Za-z0-9_.:-]{1,64}$/

export function id(valor: unknown): string | null {
    if (typeof valor !== 'string') return null
    const limpio = valor.trim()
    return ID_VALIDO.test(limpio) ? limpio : null
}

/**
 * Claves que nunca aceptamos como nombre de propiedad en un objeto que después
 * se guarda y se vuelve a leer: evitan contaminar el prototipo al hidratar.
 */
const CLAVES_PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype'])

export function claveSegura(valor: unknown, maxLen = 48): string | null {
    const limpio = texto(valor, maxLen)
    if (!limpio) return null
    return CLAVES_PROHIBIDAS.has(limpio) ? null : limpio
}

/** Tamaño serializado de un payload, para rechazar cosas desmedidas. */
export function excedeTamanio(valor: unknown, maxBytes: number): boolean {
    try {
        return JSON.stringify(valor ?? null).length > maxBytes
    } catch {
        // Referencias circulares o BigInt: no es algo que queramos guardar.
        return true
    }
}
