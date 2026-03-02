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
        <div className="cyber-card flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Calendar size={24} />
                <h3 className="font-bold uppercase tracking-widest text-sm text-amber-400">Días sin comer Don Saturs</h3>
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={() => updateCounter(-1)}
                    disabled={loading || (days ?? 0) <= 0}
                    className="p-2 rounded-full border border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-500 transition-colors"
                >
                    <Minus size={20} />
                </button>

                <div className="relative min-w-[80px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                className="text-6xl font-black text-zinc-700 animate-pulse"
                            >
                                --
                            </motion.div>
                        ) : (
                            <motion.div
                                key={days}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="text-8xl font-black gradient-text"
                            >
                                {days}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => updateCounter(1)}
                    disabled={loading}
                    className="p-2 rounded-full border border-zinc-700 hover:border-green-500 text-zinc-500 hover:text-green-500 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            <button
                onClick={handleReset}
                disabled={loading}
                className="cyber-button flex items-center gap-2 mt-2 text-xs bg-red-500/20 !text-red-500 border border-red-500/50 hover:bg-red-500/40"
            >
                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                RESETEAR (COMIÓ HOY)
            </button>

            {missingDates.length > 0 && (
                <div className="mt-4 text-left w-full max-w-xs">
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">Fechas de consumo:</span>
                    <ul className="list-disc list-inside text-[12px] text-zinc-300 font-mono">
                        {missingDates.map((d, idx) => (
                            <li key={idx}>{d}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-3 text-left w-full max-w-xs">
                <span className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">Ahorro aproximado:</span>
                <ul className="text-[12px] text-zinc-300 font-mono space-y-1">
                    <li>{totalSaved} kcal ahorradas</li>
                    <li>≈ {approxChickenGrams} g de pollo</li>
                    <li>≈ {approxEggs} huevos</li>
                    <li>≈ {approxRicePlates} platos chicos de arroz</li>
                    <li>≈ {approxBife} bife(s) chico(s)</li>
                    <li>≈ {approxAvocados} palta(s) medianas</li>
                </ul>
            </div>

            <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-tighter">
                Motivación: 5 galletitas ≈ 200-250 kcal → ahorrar ~220 kcal/día
            </p>
        </div>
    )
}
