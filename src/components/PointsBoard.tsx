'use client'

import { useState, useEffect } from 'react'
import { Star, Plus, Minus, Coffee, Trash2, Box, Utensils, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
    { id: 'facturas', label: 'Facturas 🥐', icon: Utensils, color: 'text-orange-400' },
    { id: 'limpieza', label: 'Limpieza 🧹', icon: Trash2, color: 'text-green-400' },
    { id: 'yerba_azucar', label: 'Yerba/Azucar 🧉', icon: Box, color: 'text-emerald-500' },
    { id: 'comida_viernes', label: 'Comida Viernes 🍔', icon: Coffee, color: 'text-magenta-400' },
]

const TEAM_MEMBERS = ['Roberto', 'Nicolas', 'Andrea', 'Juan', 'Tobias', 'Matias', 'Norber', 'Eze']

export default function PointsBoard() {
    const [points, setPoints] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchPoints()
        const interval = setInterval(fetchPoints, 5000)
        return () => clearInterval(interval)
    }, [])

    const fetchPoints = async () => {
        try {
            const res = await fetch('/api/karma')
            const data = await res.json()
            setPoints(data)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const updatePoints = async (memberId: string, category: string, delta: number) => {
        try {
            const res = await fetch('/api/karma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, category, delta })
            })
            const data = await res.json()
            setPoints(data)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="cyber-card flex flex-col gap-4">
            <div className="flex items-center gap-2 text-magenta-500 border-b border-zinc-800 pb-3">
                <Star size={20} fill="currentColor" />
                <h3 className="font-bold uppercase tracking-widest text-sm italic">KARMA POR INTEGRANTE 🏆</h3>
            </div>

            {/* Category Selector */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-tighter whitespace-nowrap transition-all
                            ${activeCategory === cat.id
                                ? 'bg-magenta-500/20 text-magenta-400 border border-magenta-500/50'
                                : 'text-zinc-500 border border-zinc-800 hover:border-zinc-700'}
                        `}
                    >
                        <cat.icon size={12} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {TEAM_MEMBERS.map((member) => {
                    const pointKey = `${member}_${activeCategory}`
                    return (
                        <div key={member} className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800/50 group">
                            <span className="text-xs font-bold text-zinc-300 uppercase italic">{member}</span>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updatePoints(member, activeCategory, -1)}
                                    className="p-1 hover:bg-red-500/10 rounded text-zinc-700 hover:text-red-500 transition-all"
                                >
                                    <Minus size={14} />
                                </button>

                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={points[pointKey]}
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="min-w-[24px] text-center font-black text-white font-mono text-sm"
                                    >
                                        {points[pointKey] || 0}
                                    </motion.span>
                                </AnimatePresence>

                                <button
                                    onClick={() => updatePoints(member, activeCategory, 1)}
                                    className="p-1 hover:bg-green-500/10 rounded text-zinc-700 hover:text-green-500 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="pt-2 border-t border-zinc-900 flex justify-between items-center bg-black/20 -mx-6 px-6 -mb-6">
                <span className="text-[9px] text-zinc-700 font-mono uppercase">
                    Update: {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
                </span>
                <span className="text-[9px] text-zinc-700 font-mono uppercase">Karma-System-Online</span>
            </div>
        </div>
    )
}
