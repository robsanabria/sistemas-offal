'use client'

import { useState, useEffect } from 'react'
import { Calendar, RefreshCcw, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RobertoCounter() {
    const [days, setDays] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [missingDates, setMissingDates] = useState<string[]>([])

    useEffect(() => {
        fetch('/api/counters/roberto')
            .then(res => res.json())
            .then(data => {
                setDays(data.days)
                setLoading(false)
            })

        const saved = localStorage.getItem('robertoMissingDates')
        if (saved) {
            try { setMissingDates(JSON.parse(saved)) } catch {}
        }
    }, [])

    const updateCounter = async (delta: number | null, reset: boolean = false) => {
        setLoading(true)
        const res = await fetch('/api/counters/roberto', {
            method: 'POST',
            body: JSON.stringify({ delta, reset }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        setDays(data.days)
        setLoading(false)
    }

    const addMissingDate = (date: string) => {
        const updated = [...missingDates, date]
        setMissingDates(updated)
        try {
            localStorage.setItem('robertoMissingDates', JSON.stringify(updated))
        } catch {}
    }

    const handleReset = async () => {
        const today = new Date().toLocaleDateString('es-AR')
        await updateCounter(null, true)
        addMissingDate(today)
    }

    const savedPerDay = 220 // kcal aproximadas ahorradas por evitar 5 galletitas
    const totalSaved = (days ?? 0) * savedPerDay
    const approxChickenGrams = Math.round((totalSaved / 220) * 165) // usando 165g como punto medio
    const approxEggs = Math.round(totalSaved / 70)
    const approxRicePlates = Math.round(totalSaved / 200)
    const approxBife = Math.round(totalSaved / 250)
    const approxAvocados = Math.round(totalSaved / 200)

    return (
        <div className="glass-card flex flex-col items-center justify-center gap-6 text-center relative overflow-hidden group min-h-[450px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={80} />
            </div>

            <div className="space-y-1">
                <h3 className="font-black uppercase tracking-[0.2em] text-xs text-amber-400/80">Protocolo Saturs-Free</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Días sin comer Don Saturs</p>
            </div>

            <div className="flex items-center gap-6 z-10">
                <button
                    onClick={() => updateCounter(-1)}
                    disabled={loading || (days ?? 0) <= 0}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition-all active:scale-90"
                >
                    <Minus size={20} />
                </button>

                <div className="relative min-w-[100px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                className="text-7xl font-black text-zinc-800 animate-pulse"
                            >
                                --
                            </motion.div>
                        ) : (
                            <motion.div
                                key={days}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="text-9xl font-black tracking-tighter gradient-text drop-shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                            >
                                {days}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => updateCounter(1)}
                    disabled={loading}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-emerald-400 hover:border-emerald-400/30 transition-all active:scale-90"
                >
                    <Plus size={20} />
                </button>
            </div>

            <button
                onClick={handleReset}
                disabled={loading}
                className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black tracking-widest hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-95 disabled:opacity-50"
            >
                <RefreshCcw size={14} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                RESETEAR SISTEMA
            </button>

            <div className="w-full space-y-4">
                <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-3 tracking-widest">Optimización de Salud</div>
                    <div className="grid grid-cols-2 gap-2 text-left">
                        {[
                            { label: 'Kcal Ahorradas', value: totalSaved, unit: 'kcal' },
                            { label: 'Equiv. Pollo', value: approxChickenGrams, unit: 'g' },
                            { label: 'Equiv. Huevos', value: approxEggs, unit: 'u' },
                            { label: 'Equiv. Arroz', value: approxRicePlates, unit: 'p' }
                        ].map((item, i) => (
                            <div key={i} className="px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-[8px] text-zinc-600 uppercase font-bold">{item.label}</div>
                                <div className="text-xs font-mono text-zinc-300">
                                    <span className="text-amber-400 font-bold">{item.value}</span> {item.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {missingDates.length > 0 && (
                    <div className="pt-2">
                        <div className="flex flex-wrap gap-1 justify-center">
                            {missingDates.slice(-3).map((d, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-red-500/5 rounded text-[8px] text-zinc-600 font-mono">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
