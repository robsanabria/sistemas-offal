import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GLOBAL_BUDGET, budgetFor, clientKey, localLimit, sharedLimit } from '@/lib/rateLimit'
import type { RateResult } from '@/lib/rateLimit'

// Rate limiting para todo /api (proxy = el middleware de Next 16). Se hace acá y
// no en cada route handler para que
// una ruta nueva quede cubierta por defecto en vez de olvidada.
//
// Dos capas:
//   1. Contador en memoria (gratis, por instancia) para todos los métodos. Corta
//      el caso real de colapso: una pestaña con un loop desbocado.
//   2. Contador en Redis (compartido entre instancias) solo para los métodos que
//      escriben, que son pocos y ya iban a tocar Redis igual. Las lecturas no lo
//      pagan, para no inflar la cuota de Upstash en el camino caliente.

const METODOS_DE_LECTURA = new Set(['GET', 'HEAD', 'OPTIONS'])

function respuesta429(resultado: RateResult) {
    return NextResponse.json(
        { error: 'Demasiadas solicitudes. Esperá unos segundos.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(resultado.retryAfterSec || 60),
                'X-RateLimit-Limit': String(resultado.limit),
                'X-RateLimit-Remaining': String(resultado.remaining),
                'Cache-Control': 'no-store',
            },
        },
    )
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const budget = budgetFor(pathname)
    if (!budget) return NextResponse.next()

    const cliente = clientKey(request.headers)

    // Techo global por IP sobre todo /api.
    const global = localLimit(`global:${cliente}`, GLOBAL_BUDGET)
    if (!global.ok) return respuesta429(global)

    // Límite por grupo de rutas.
    const local = localLimit(`${budget.scope}:${cliente}`, budget.local)
    if (!local.ok) return respuesta429(local)

    if (budget.shared && !METODOS_DE_LECTURA.has(request.method)) {
        const compartido = await sharedLimit(`${budget.scope}:${cliente}`, budget.shared)
        if (!compartido.ok) return respuesta429(compartido)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
