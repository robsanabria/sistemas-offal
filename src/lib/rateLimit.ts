import { Redis } from '@upstash/redis'

export type RateRule = {
    /** Cantidad máxima de requests permitidas dentro de la ventana. */
    limit: number
    /** Tamaño de la ventana en milisegundos. */
    windowMs: number
}

export type RateResult = {
    ok: boolean
    limit: number
    remaining: number
    retryAfterSec: number
}

/* ------------------------------------------------------------------ */
/* Identificación del cliente                                          */
/* ------------------------------------------------------------------ */

// Solo caracteres válidos de IPv4 / IPv6. Un header hostil no puede inflar la
// memoria del proceso ni inyectar separadores en la key de Redis.
const IP_VALIDA = /^[0-9a-fA-F:.]{3,45}$/

export function clientKey(headers: Headers): string {
    const candidatos = [
        headers.get('x-vercel-forwarded-for'),
        headers.get('x-real-ip'),
        headers.get('x-forwarded-for')?.split(',')[0],
    ]
    for (const candidato of candidatos) {
        const ip = candidato?.trim()
        if (ip && IP_VALIDA.test(ip)) return ip
    }
    return 'sin-ip'
}

/* ------------------------------------------------------------------ */
/* Límite local (en memoria del proceso)                               */
/* ------------------------------------------------------------------ */

// Ventana fija por (cliente + grupo de rutas). Es por instancia, así que en
// serverless no es un límite global exacto -- pero es gratis (0 comandos de
// Redis) y alcanza para cortar el caso real que nos interesa: una pestaña con
// un loop desbocado golpeando el mismo lambda.

type Bucket = { count: number; resetAt: number }

const MAX_BUCKETS = 10_000
const buckets = new Map<string, Bucket>()
let ultimaLimpieza = 0

function limpiar(ahora: number) {
    if (ahora - ultimaLimpieza < 30_000 && buckets.size < MAX_BUCKETS) return
    ultimaLimpieza = ahora
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= ahora) buckets.delete(key)
    }
    // Si incluso después de limpiar sigue gigante (muchas IPs activas a la vez),
    // tiramos todo: preferimos perder contadores antes que la memoria del proceso.
    if (buckets.size > MAX_BUCKETS) buckets.clear()
}

export function localLimit(key: string, rule: RateRule, ahora = Date.now()): RateResult {
    limpiar(ahora)

    const bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= ahora) {
        buckets.set(key, { count: 1, resetAt: ahora + rule.windowMs })
        return { ok: true, limit: rule.limit, remaining: rule.limit - 1, retryAfterSec: 0 }
    }

    bucket.count += 1
    return {
        ok: bucket.count <= rule.limit,
        limit: rule.limit,
        remaining: Math.max(0, rule.limit - bucket.count),
        retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - ahora) / 1000)),
    }
}

/* ------------------------------------------------------------------ */
/* Límite compartido (contador en Redis, común a todas las instancias) */
/* ------------------------------------------------------------------ */

let clienteRedis: Redis | null | undefined

function getRedis(): Redis | null {
    if (clienteRedis !== undefined) return clienteRedis
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
    clienteRedis = url && token ? new Redis({ url, token }) : null
    return clienteRedis
}

// Cuesta 1 comando por request (2 en la primera de cada ventana), así que se usa
// solo donde vale la pena: las rutas que escriben. Las de lectura se quedan con
// el límite local para no inflar la cuota de Upstash justo en el camino caliente.
export async function sharedLimit(key: string, rule: RateRule): Promise<RateResult> {
    const redis = getRedis()
    if (!redis) {
        return { ok: true, limit: rule.limit, remaining: rule.limit, retryAfterSec: 0 }
    }

    const ventanaSeg = Math.ceil(rule.windowMs / 1000)
    const ventana = Math.floor(Date.now() / rule.windowMs)
    const redisKey = `rl:${key}:${ventana}`

    try {
        const count = await redis.incr(redisKey)
        // Solo la primera request de la ventana paga el EXPIRE.
        if (count === 1) await redis.expire(redisKey, ventanaSeg + 1)

        return {
            ok: count <= rule.limit,
            limit: rule.limit,
            remaining: Math.max(0, rule.limit - count),
            retryAfterSec: ventanaSeg,
        }
    } catch (err) {
        // Fail-open a propósito: si Redis no responde preferimos servir la request
        // (el límite local ya puso un techo) antes que tirar abajo toda la app.
        console.error('rateLimit: falló el contador compartido en %s', redisKey, err)
        return { ok: true, limit: rule.limit, remaining: rule.limit, retryAfterSec: 0 }
    }
}

/* ------------------------------------------------------------------ */
/* Presupuesto por grupo de rutas                                      */
/* ------------------------------------------------------------------ */

export type RouteBudget = {
    /** Nombre del grupo; se usa como parte de la key del contador. */
    scope: string
    pattern: RegExp
    /** Límite en memoria, se aplica a todos los métodos. */
    local: RateRule
    /** Límite compartido en Redis, solo para métodos que escriben. */
    shared?: RateRule
}

const MINUTO = 60_000

// Ordenado de más específico a más general: gana la primera coincidencia.
export const ROUTE_BUDGETS: RouteBudget[] = [
    // El dibujante publica trazos en lote (~10 req/s). Dejamos aire hasta 15/s y
    // cortamos ahí: sin esto, un mousemove suelto son ~60 req/s por persona.
    {
        scope: 'publish',
        pattern: /^\/api\/publish/,
        local: { limit: 900, windowMs: MINUTO },
        shared: { limit: 1800, windowMs: MINUTO },
    },

    // Polling de lectura: el loop del cliente corre 1/s, le damos 3/s.
    { scope: 'poll', pattern: /^\/api\/poll/, local: { limit: 180, windowMs: MINUTO } },
    { scope: 'room-state', pattern: /^\/api\/room\/state/, local: { limit: 180, windowMs: MINUTO } },

    // Acciones destructivas de sala: nadie necesita más que un puñado por minuto.
    {
        scope: 'room-admin',
        pattern: /^\/api\/room\/(reset|next)/,
        local: { limit: 20, windowMs: MINUTO },
        shared: { limit: 40, windowMs: MINUTO },
    },
    {
        scope: 'room',
        pattern: /^\/api\/room/,
        local: { limit: 60, windowMs: MINUTO },
        shared: { limit: 120, windowMs: MINUTO },
    },

    // Endpoint de debug: deliberadamente muy bajo.
    { scope: 'debug', pattern: /^\/api\/debug/, local: { limit: 10, windowMs: MINUTO } },

    // Proxy de Giphy: la cuota es de una API de terceros, la cuidamos.
    {
        scope: 'giphy',
        pattern: /^\/api\/giphy/,
        local: { limit: 60, windowMs: MINUTO },
        shared: { limit: 120, windowMs: MINUTO },
    },

    // Resto de los widgets del tablero (contadores, pizarra, morse, truco, etc.).
    {
        scope: 'api',
        pattern: /^\/api\//,
        local: { limit: 120, windowMs: MINUTO },
        shared: { limit: 240, windowMs: MINUTO },
    },
]

export function budgetFor(pathname: string): RouteBudget | null {
    for (const budget of ROUTE_BUDGETS) {
        if (budget.pattern.test(pathname)) return budget
    }
    return null
}

// Techo global por IP sobre todo /api, aparte del límite por ruta. Es la red de
// seguridad para el caso "muchas rutas distintas, todas a la vez".
export const GLOBAL_BUDGET: RateRule = { limit: 1200, windowMs: MINUTO }
