'use client'

import { useState, useEffect } from 'react'
import { Trophy, RotateCcw, Plus, Minus, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Fofitos = ({ count }: { count: number }) => {
    const groups = Math.floor(count / 5)
    const remainder = count % 5

    const renderFofito = (n: number) => {
        return (
            <div className="relative w-12 h-12 border border-zinc-800/50 rounded p-1 flex items-center justify-center">
                {n >= 1 && <div className="absolute top-1 left-2 w-1 h-8 bg-cyan-500 rounded-full" />}
                {n >= 2 && <div className="absolute bottom-1 left-2 w-8 h-1 bg-cyan-500 rounded-full" />}
                {n >= 3 && <div className="absolute top-1 right-2 w-1 h-8 bg-cyan-500 rounded-full" />}
                {n >= 4 && <div className="absolute top-1 left-2 w-8 h-1 bg-cyan-500 rounded-full" />}
                {n >= 5 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 left-1 w-10 h-10 border-t-2 border-l-2 rotate-45 border-cyan-400 opacity-80" />}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: groups }).map((_, i) => (
                <div key={i}>{renderFofito(5)}</div>
            ))}
            {remainder > 0 && <div>{renderFofito(remainder)}</div>}
        </div>
    )
}

export default function TrucoScorer() {
    const [score, setScore] = useState({ nosotros: 0, ellos: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchScore()
        const interval = setInterval(fetchScore, 5000) // Sync every 5s
        return () => clearInterval(interval)
    }, [])

    const fetchScore = async () => {
        try {
            const res = await fetch('/api/truco')
            const data = await res.json()
            setScore(data)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const updateScore = async (team: 'nosotros' | 'ellos', delta: number) => {
        const newVal = Math.max(0, Math.min(30, score[team] + delta))
        const newScore = { ...score, [team]: newVal }
        setScore(newScore)

        try {
            await fetch('/api/truco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [team]: newVal })
            })
        } catch (e) {
            console.error(e)
        }
    }

    const resetScore = async () => {
        if (confirm('¿Reiniciar partido?')) {
            setScore({ nosotros: 0, ellos: 0 })
            try {
                await fetch('/api/truco', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reset: true })
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <div className="cyber-card">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Trophy size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Anotador de Truco Profundo 🃏</h3>
                </div>
                <button
                    onClick={resetScore}
                    className="p-1 hover:bg-red-500/10 rounded-full text-zinc-600 hover:text-red-500 transition-all"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bottom-0 w-[1px] bg-zinc-800" />

                {/* Nosotros */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Nosotros</span>
                    <div className="text-4xl font-black text-white">{score.nosotros}</div>
                    <div className="min-h-[120px]">
                        <Fofitos count={score.nosotros} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => updateScore('nosotros', -1)} className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800"><Minus size={16} /></button>
                        <button onClick={() => updateScore('nosotros', 1)} className="p-2 bg-cyan-600 rounded-lg hover:bg-cyan-500"><Plus size={16} /></button>
                    </div>
                </div>

                {/* Ellos */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Ellos</span>
                    <div className="text-4xl font-black text-white">{score.ellos}</div>
                    <div className="min-h-[120px]">
                        <Fofitos count={score.ellos} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => updateScore('ellos', -1)} className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800"><Minus size={16} /></button>
                        <button onClick={() => updateScore('ellos', 1)} className="p-2 bg-magenta-600 rounded-lg hover:bg-magenta-500"><Plus size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <div className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] items-center flex gap-2 font-mono text-zinc-500 uppercase">
                    <Users size={12} />
                    <span>Sincronizado en tiempo real</span>
                </div>
            </div>
        </div>
    )
}
