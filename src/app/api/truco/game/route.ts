import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'

const GAME_KEY = 'office:truco:game_state'

const SUITS = ['espada', 'basto', 'oro', 'copa']
const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]

function createDeck() {
    const deck = []
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({ suit, value, id: `${suit}-${value}-${Math.random()}` })
        }
    }
    return deck.sort(() => Math.random() - 0.5)
}

export async function GET() {
    let state: any = await kv.get(GAME_KEY) || { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }
    // sanitize players: remove falsy entries, dedupe and limit to 2
    state.players = Array.isArray(state.players) ? Array.from(new Set(state.players.filter(Boolean))).slice(0, 2) : []
    // ensure score shape
    if (!state.score) state.score = { nosotros: 0, ellos: 0 }
    await kv.set(GAME_KEY, state)
    return NextResponse.json(state)
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}))
    const { action, playerId, cardId, team, delta } = body

    let state: any = await kv.get(GAME_KEY) || { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }

    if (!state.score) state.score = { nosotros: 0, ellos: 0 }

    if (action === 'join') {
        // ignore invalid player ids
        if (!playerId || typeof playerId !== 'string') {
            return NextResponse.json(state)
        }
        // sanitize existing players and dedupe
        const players = Array.isArray(state.players) ? Array.from(new Set(state.players.filter(Boolean))) : []
        if (!players.includes(playerId) && players.length < 2) {
            players.push(playerId)
        }
        state.players = players.slice(0, 2)
        if (!state.turn && state.players.length > 0) state.turn = state.players[0]
    }

    if (action === 'deal') {
        const deck = createDeck()
        state.table = []
        state.players.forEach((p: string, i: number) => {
            state.hands[p] = deck.splice(0, 3)
        })
        state.turn = state.players[0]
    }

    if (action === 'reset') {
        state = { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }
    }

    if (action === 'playCard') {
        if (state.turn === playerId) {
            const hand = state.hands[playerId] || []
            const cardIdx = hand.findIndex((c: any) => c.id === cardId)
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
        if (team === 'nosotros') state.score.nosotros = Math.max(0, state.score.nosotros + delta)
        if (team === 'ellos') state.score.ellos = Math.max(0, state.score.ellos + delta)
    }

    if (action === 'resetScore') {
        state.score = { nosotros: 0, ellos: 0 }
    }

    await kv.set(GAME_KEY, state)
    return NextResponse.json(state)
}
