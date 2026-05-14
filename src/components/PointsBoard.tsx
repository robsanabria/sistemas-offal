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
        <div className="glass-card flex flex-col gap-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Star size={80} fill="currentColor" />
            </div>

            <div className="flex items-center gap-2 z-10">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-yellow-400/80 italic">Sistema de Karma Pro</h3>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar z-10">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300
                            ${activeCategory === cat.id
                                ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                                : 'text-zinc-500 border border-transparent hover:bg-white/5'}
                        `}
                    >
                        <cat.icon size={12} className={activeCategory === cat.id ? 'text-cyan-400' : ''} />
                        {cat.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar z-10 min-h-[300px]">
                {TEAM_MEMBERS.map((member, idx) => {
                    const pointKey = `${member}_${activeCategory}`
                    const pts = points[pointKey] || 0
                    return (
                        <div key={member} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-zinc-600 w-4">{idx + 1}.</span>
                                <span className="text-xs font-black text-zinc-300 uppercase tracking-tighter">{member}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => updatePoints(member, activeCategory, -1)}
                                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-700 hover:text-red-400 transition-all active:scale-90"
                                >
                                    <Minus size={14} />
                                </button>

                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={pts}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`min-w-[28px] text-center font-black font-mono text-sm ${pts > 0 ? 'text-emerald-400' : pts < 0 ? 'text-red-400' : 'text-zinc-500'}`}
                                    >
                                        {pts}
                                    </motion.span>
                                </AnimatePresence>

                                <button
                                    onClick={() => updatePoints(member, activeCategory, 1)}
                                    className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-zinc-700 hover:text-emerald-400 transition-all active:scale-90"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">
                        LIVE SYNC {mounted ? new Date().toLocaleTimeString() : '--'}
                    </span>
                </div>
                <div className="text-[8px] text-zinc-700 font-mono">v2.4.0_KARMA</div>
            </div>
        </div>
    )
}
