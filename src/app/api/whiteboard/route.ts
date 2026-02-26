import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const WHITEBOARD_KEY = 'office:whiteboard:content'

export async function GET() {
    try {
        const content = await kv.get(WHITEBOARD_KEY) || ""
        return NextResponse.json({ content })
    } catch (error) {
        return NextResponse.json({ content: "" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { content } = await req.json()
        await kv.set(WHITEBOARD_KEY, content)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}
