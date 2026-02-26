'use client'

import { useState, useEffect } from 'react'
import { Trophy, Users, Play, RotateCcw, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Card {
    suit: 'espada' | 'basto' | 'oro' | 'copa'
    value: number
    id: string
}

export default function TrucoGame() {
    const [gameState, setGameState] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null)

    useEffect(() => {
        // Generate a simple ID for the session
        if (!myPlayerId) {
            const id = Math.random().toString(36).substring(7)
            setMyPlayerId(id)
        }
        fetchState()
        const interval = setInterval(fetchState, 3000)
        return () => clearInterval(interval)
    }, [myPlayerId])

    const fetchState = async () => {
        try {
            const res = await fetch('/api/truco/game')
            const data = await res.json()
            setGameState(data)
            setLoading(false)

            // if two players joined and cards not yet dealt, auto-deal
            if (data.players?.length === 2 && (!data.hands || Object.keys(data.hands).length === 0)) {
                dealCards()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const joinGame = async () => {
        await fetch('/api/truco/game', {
            method: 'POST',
            body: JSON.stringify({ action: 'join', playerId: myPlayerId }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchState()
    }

    const dealCards = async () => {
        await fetch('/api/truco/game', {
            method: 'POST',
            body: JSON.stringify({ action: 'deal' }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchState()
    }

    const playCard = async (cardId: string) => {
        await fetch('/api/truco/game', {
            method: 'POST',
            body: JSON.stringify({ action: 'playCard', playerId: myPlayerId, cardId }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchState()
    }

    const playActionAudio = (action: 'truco' | 'envido') => {
        const urls = {
            truco: "https://www.myinstants.com/media/sounds/truco_1.mp3",
            envido: "https://www.myinstants.com/media/sounds/envido.mp3"
        }
        const audio = new Audio(urls[action])
        audio.volume = 1.0
        audio.play().catch(e => console.error("Audio failed", e))
    }

    const updateScore = async (team: 'nosotros' | 'ellos', delta: number) => {
        await fetch('/api/truco/game', {
            method: 'POST',
            body: JSON.stringify({ action: 'updateScore', team, delta }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchState()
    }

    if (loading) return <div className="cyber-card animate-pulse h-64 bg-zinc-900/50" />

    return (
        <div className="cyber-card flex flex-col gap-6 min-h-[600px] relative overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Trophy size={20} />
                        <h3 className="font-bold uppercase tracking-widest text-sm italic">Truco Online 🃏</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">Players: {gameState?.players?.length || 0}/2</span>
                        {gameState?.turn && (
                            <span className="text-[10px] font-mono uppercase tracking-tighter">
                                {gameState.turn === myPlayerId ? '🟢 Tu turno' : '⚪️ Turno otro'}
                            </span>
                        )}
                        <button onClick={dealCards} title="Repartir" className="p-1 hover:bg-zinc-800 rounded transition-colors">
                            <RotateCcw size={16} className="text-zinc-500 hover:text-yellow-500" />
                        </button>
                    </div>
                </div>

                {/* Integrated Scoreboard */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/50 border border-zinc-800 p-2 rounded-lg flex flex-col items-center group">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter mb-1">Nosotros</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => updateScore('nosotros', -1)} className="text-zinc-700 hover:text-red-500 transition-colors">
                                <Minus size={14} />
                            </button>
                            <span className="text-2xl font-black text-white font-mono tracking-tighter">
                                {gameState?.score?.nosotros || 0}
                            </span>
                            <button onClick={() => updateScore('nosotros', 1)} className="text-zinc-700 hover:text-green-500 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="bg-zinc-950/50 border border-zinc-800 p-2 rounded-lg flex flex-col items-center group">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter mb-1">Ellos</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => updateScore('ellos', -1)} className="text-zinc-700 hover:text-red-500 transition-colors">
                                <Minus size={14} />
                            </button>
                            <span className="text-2xl font-black text-white font-mono tracking-tighter">
                                {gameState?.score?.ellos || 0}
                            </span>
                            <button onClick={() => updateScore('ellos', 1)} className="text-zinc-700 hover:text-green-500 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* render based on join / players count */}
            {!gameState?.players?.includes(myPlayerId) ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <Play size={48} className="text-yellow-500 opacity-20" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full"
                        />
                    </div>
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-tighter">¿Listo para el partido?</p>
                    <button onClick={joinGame} className="cyber-button bg-yellow-600/20 !text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                        SENTARSE A LA MESA
                    </button>
                </div>
            ) : gameState.players?.length < 2 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Users size={40} className="text-zinc-500 opacity-20" />
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-tighter">
                        Esperando que otro jugador se una...
                    </p>
                    {gameState.turn && (
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                            {gameState.turn === myPlayerId ? 'Tu turno cuando se reparta' : 'Turno del otro cuando se reparta'}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Mesa (Table) */}
                    <div className="flex-1 bg-green-950/10 rounded-2xl border border-green-500/10 relative flex items-center justify-center min-h-[160px]">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-green-500/20 uppercase tracking-widest">Sistemicos-Arena</div>

                        <div className="flex gap-4">
                            <AnimatePresence>
                                {gameState?.table?.map((c: any, i: number) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ scale: 0.5, y: 50, opacity: 0 }}
                                        animate={{ scale: 1, y: 0, opacity: 1, rotate: i * 5 - 5 }}
                                        className="w-14 h-20 bg-white rounded shadow-2xl flex flex-col items-center justify-center border-2 border-zinc-200"
                                    >
                                        <span className={`text-xl font-black ${['espada', 'basto'].includes(c.suit) ? 'text-zinc-950' : 'text-red-600'}`}>
                                            {c.value}
                                        </span>
                                        <span className="text-[8px] uppercase font-black text-zinc-400 tracking-tighter">{c.suit}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mi Mano (My Hand) & Actions */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {gameState?.hands?.[myPlayerId || '']?.map((c: any) => (
                                <motion.button
                                    key={c.id}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => playCard(c.id)}
                                    className="w-14 h-20 bg-zinc-100 rounded shadow-lg border-2 border-zinc-300 flex flex-col items-center justify-center group"
                                >
                                    <span className={`text-xl font-black group-hover:scale-110 transition-transform ${['espada', 'basto'].includes(c.suit) ? 'text-zinc-950' : 'text-red-600'}`}>
                                        {c.value}
                                    </span>
                                    <span className="text-[8px] uppercase font-black text-zinc-400 tracking-tighter">{c.suit}</span>
                                </motion.button>
                            ))}
                            {(!gameState?.hands?.[myPlayerId || ''] || gameState?.hands?.[myPlayerId || ''].length === 0) && (
                                <div className="text-zinc-700 text-[10px] font-mono uppercase italic py-6">Esperando reparto...</div>
                            )}
                        </div>

                        <div className="w-full h-px bg-zinc-800/50" />

                        <div className="flex justify-between w-full items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => playActionAudio('truco')}
                                    className="px-3 py-1.5 border border-zinc-800 text-[10px] font-bold text-zinc-500 rounded uppercase hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/50 transition-all active:scale-95"
                                >
                                    ¡Truco!
                                </button>
                                <button
                                    onClick={() => playActionAudio('envido')}
                                    className="px-3 py-1.5 border border-zinc-800 text-[10px] font-bold text-zinc-500 rounded uppercase hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/50 transition-all active:scale-95"
                                >
                                    ¡Envido!
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${gameState?.turn === myPlayerId ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`} />
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                                    {gameState?.turn === myPlayerId ? 'Tu Turno' : 'Esperando...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-[9px] text-zinc-800 text-center font-mono py-2 bg-black/40 -mx-6 -mb-6 border-t border-zinc-900/50">
                QIERO VALE 4 • ONLINE COLLABORATIVE ENGINE
            </div>
        </div>
    )
}
