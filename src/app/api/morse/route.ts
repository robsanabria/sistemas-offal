import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const MORSE_MESSAGES_KEY = 'office:morse:messages'

// In-memory fallback for local development when Vercel KV is not configured
let localFallbackMessages: any[] = []

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
        const { message } = await req.json()
        if (!message) {
            return NextResponse.json({ error: 'Message payload required' }, { status: 400 })
        }
        
        const newMessage = {
            ...message,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }

        // Fallback if environment variables are not present
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            localFallbackMessages = [newMessage, ...localFallbackMessages].slice(0, 20)
            return NextResponse.json({ success: true, messages: localFallbackMessages })
        }

        const current = await kv.get<any[]>(MORSE_MESSAGES_KEY) || []
        const updated = [newMessage, ...current].slice(0, 20)
        
        await kv.set(MORSE_MESSAGES_KEY, updated)
        return NextResponse.json({ success: true, messages: updated })
    } catch (error) {
        console.warn('Vercel KV save failed, falling back to local memory:', error)
        return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }
}
