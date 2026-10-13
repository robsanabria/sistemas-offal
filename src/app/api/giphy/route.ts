import { NextResponse } from 'next/server'

// Proxy server-side de Giphy. La API key vive solo acá: si se leyera desde el
// componente (NEXT_PUBLIC_*) quedaría escrita en el bundle que baja el browser y
// cualquiera podría quemarnos la cuota.
//
// El endpoint es público igual que el resto del tablero, así que lo que lo
// protege es el rate limit de src/middleware.ts (60/min por IP) y devolver lo
// mínimo: solo la URL del gif, nunca la respuesta cruda de Giphy.

export async function GET() {
    const apiKey = process.env.GIPHY_API_KEY
    if (!apiKey) {
        // Sin key no es un error: el componente tiene su propia colección curada.
        return NextResponse.json({ url: null }, { headers: { 'Cache-Control': 'no-store' } })
    }

    try {
        const url = new URL('https://api.giphy.com/v1/gifs/random')
        url.searchParams.set('api_key', apiKey)
        url.searchParams.set('tag', 'the-simpsons')
        url.searchParams.set('rating', 'g')

        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!res.ok) {
            console.error('giphy: respuesta no OK (status %s)', res.status)
            return NextResponse.json({ url: null }, { headers: { 'Cache-Control': 'no-store' } })
        }

        const json = await res.json()
        const gifUrl = json?.data?.images?.original?.url
        return NextResponse.json(
            { url: typeof gifUrl === 'string' ? gifUrl : null },
            { headers: { 'Cache-Control': 'no-store' } },
        )
    } catch (err) {
        console.error('giphy: falló el pedido', err)
        return NextResponse.json({ url: null }, { headers: { 'Cache-Control': 'no-store' } })
    }
}
