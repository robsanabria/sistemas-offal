'use client'

import { useState, useEffect } from 'react'
import { Smile, User } from 'lucide-react'
import { motion } from 'framer-motion'

const EMOJIS = ['😎', '💻', '🥩', '☕', '🚀', '😴', '🤡', '🔥', '🛵', '💼', '😂', '😡', '😱', '😇', '🤖']
const TEAM = ['Roberto', 'Nicolas', 'Andrea', 'Juan', 'Tobias', 'Matias', 'Norber', 'Eze', 'Miguel', 'Luis']

export default function MoodBoard() {
    const [moods, setMoods] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchMoods()
        const interval = setInterval(fetchMoods, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    const fetchMoods = async () => {
        try {
            const res = await fetch('/api/mood')
            const data = await res.json()
            setMoods(data.moods)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const updateMood = async (name: string, mood: string) => {
        setUpdating(name)
        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                body: JSON.stringify({ name, mood }),
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            setMoods(data.moods)
        } catch (e) {
            console.error(e)
        }
        setUpdating(null)
    }

    return (
        <div className="cyber-card">
            <div className="flex items-center gap-2 text-green-400 mb-6 border-b border-zinc-800 pb-2">
                <Smile size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Como te sentis hoy?</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TEAM.map((name) => (
                    <div key={name} className="flex flex-col items-center gap-2 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                        <div className="text-sm font-mono text-zinc-400 flex items-center gap-1">
                            <User size={12} />
                            {name === 'Nicolas' ? 'Nicolas' : name}
                        </div>

                        <div className="relative group cursor-pointer">
                            <div className="text-3xl filter hover:drop-shadow-[0_0_8px_white] transition-all">
                                {moods[name] || '❓'}
                            </div>

                            {/* Mood Selector Dropdown */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:flex bg-zinc-900 border border-zinc-700 p-2 rounded-lg gap-2 z-50 shadow-2xl">
                                {EMOJIS.map(e => (
                                    <button
                                        key={e}
                                        onClick={() => updateMood(name, e)}
                                        className="hover:scale-150 transition-transform active:scale-90"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {updating === name && (
                            <div className="text-[8px] text-cyan-400 animate-pulse font-mono uppercase">Updating...</div>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-zinc-600 mt-6 text-center font-mono italic">
                "Click en el emoji para cambiar."
            </p>
        </div>
    )
}
