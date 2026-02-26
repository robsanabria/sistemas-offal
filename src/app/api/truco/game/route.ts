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
    const state = await kv.get(GAME_KEY) || { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }
    return NextResponse.json(state)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { action, playerId, cardId, team, delta } = body

    let state: any = await kv.get(GAME_KEY) || { players: [], hands: {}, table: [], turn: null, score: { nosotros: 0, ellos: 0 } }

    if (!state.score) state.score = { nosotros: 0, ellos: 0 }

    if (action === 'join') {
        if (!state.players.includes(playerId) && state.players.length < 2) {
            state.players.push(playerId)
            if (state.players.length === 1) state.turn = playerId
        }
    }

    if (action === 'deal') {
        const deck = createDeck()
        state.table = []
        state.players.forEach((p: string, i: number) => {
            state.hands[p] = deck.splice(0, 3)
        })
        state.turn = state.players[0]
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
