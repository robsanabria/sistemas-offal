import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { entero, id as validarId } from '@/lib/validate'

const GAME_KEY = 'office:truco:game_state'

const SUITS = ['espada', 'basto', 'oro', 'copa']
const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]

const ACCIONES = new Set(['join', 'deal', 'reset', 'playCard', 'updateScore', 'resetScore'])
const MAX_PUNTOS = 60
const MAX_DELTA = 30

type Carta = { suit: string; value: number; id: string }
type Estado = {
    players: string[]
    hands: Record<string, Carta[]>
    table: Carta[]
    turn: string | null
    score: { nosotros: number; ellos: number }
}

function estadoInicial(): Estado {
    return { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }
}

function createDeck(): Carta[] {
    const deck: Carta[] = []
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({ suit, value, id: `${suit}-${value}-${crypto.randomUUID()}` })
        }
    }
    return deck.sort(() => Math.random() - 0.5)
}

async function leerEstado(): Promise<Estado> {
    const guardado = await kv.get<Partial<Estado>>(GAME_KEY)
    const base = estadoInicial()
    if (!guardado || typeof guardado !== 'object') return base

    // sanitize players: remove falsy entries, dedupe and limit to 2
    const players = Array.isArray(guardado.players)
        ? Array.from(new Set(guardado.players.filter((p): p is string => typeof p === 'string' && p.length > 0))).slice(0, 2)
        : []

    return {
        players,
        hands: guardado.hands && typeof guardado.hands === 'object' ? guardado.hands : {},
        table: Array.isArray(guardado.table) ? guardado.table : [],
        turn: typeof guardado.turn === 'string' ? guardado.turn : null,
        score: {
            nosotros: entero(guardado.score?.nosotros, 0, MAX_PUNTOS) ?? 0,
            ellos: entero(guardado.score?.ellos, 0, MAX_PUNTOS) ?? 0,
        },
    }
}

export async function GET() {
    const state = await leerEstado()
    // El GET ya no reescribe el estado: lo pedía un poll cada 3s, así que era una
    // escritura en Redis por cliente por tick sin que nada hubiera cambiado.
    return NextResponse.json(state)
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}))
    const { action, cardId, team, delta } = body
    const playerId = validarId(body?.playerId)

    if (typeof action !== 'string' || !ACCIONES.has(action)) {
        return NextResponse.json({ error: 'action inválida' }, { status: 400 })
    }

    let state = await leerEstado()

    if (action === 'join') {
        // ignore invalid player ids
        if (!playerId) {
            return NextResponse.json(state)
        }
        const players = state.players
        if (!players.includes(playerId) && players.length < 2) {
            players.push(playerId)
        }
        state.players = players.slice(0, 2)
        if (!state.turn && state.players.length > 0) state.turn = state.players[0]
    }

    if (action === 'deal') {
        const deck = createDeck()
        state.table = []
        state.hands = {}
        state.players.forEach((p: string) => {
            state.hands[p] = deck.splice(0, 3)
        })
        state.turn = state.players[0] ?? null
    }

    if (action === 'reset') {
        state = estadoInicial()
    }

    if (action === 'playCard') {
        const carta = validarId(cardId)
        if (playerId && carta && state.turn === playerId) {
            const hand = state.hands[playerId] || []
            const cardIdx = hand.findIndex((c) => c.id === carta)
            if (cardIdx > -1) {
                const [card] = hand.splice(cardIdx, 1)
                state.table.push(card)
                // Switch turn
                const otherPlayer = state.players.find((p: string) => p !== playerId)
                if (otherPlayer) state.turn = otherPlayer
            }
        }
    }

    if (action === 'updateScore') {
        const puntos = entero(delta, -MAX_DELTA, MAX_DELTA)
        const equipo: 'nosotros' | 'ellos' | null =
            team === 'nosotros' ? 'nosotros' : team === 'ellos' ? 'ellos' : null
        if (puntos === null || !equipo) {
            return NextResponse.json({ error: 'team o delta inválidos' }, { status: 400 })
        }
        state.score[equipo] = Math.min(MAX_PUNTOS, Math.max(0, state.score[equipo] + puntos))
    }

    if (action === 'resetScore') {
        state.score = { nosotros: 0, ellos: 0 }
    }

    await kv.set(GAME_KEY, state)
    return NextResponse.json(state)
}
