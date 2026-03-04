'use client'

import { useState, useEffect } from 'react'
import { Calendar, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AndreaCounter() {
    const [days, setDays] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [missingDates, setMissingDates] = useState<string[]>([])

    useEffect(() => {
        fetch('/api/counters/andrea')
            .then(res => res.json())
            .then(data => {
                setDays(data.days)
                setLoading(false)
            })

        // load saved missing dates from localStorage
        const saved = localStorage.getItem('andreaMissingDates')
        if (saved) {
            try { setMissingDates(JSON.parse(saved)) } catch {}        
        }
    }, [])

    const updateCounter = async (delta: number | null, reset: boolean = false) => {
        setLoading(true)
        const res = await fetch('/api/counters/andrea', {
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
            localStorage.setItem('andreaMissingDates', JSON.stringify(updated))
        } catch {}
    }

    const handleReset = async () => {
        const today = new Date().toLocaleDateString('es-AR')
        await updateCounter(null, true)
        addMissingDate(today)
    }

    return (
        <div className="cyber-card flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Calendar size={24} />
                <h3 className="font-bold uppercase tracking-widest text-sm text-cyan-400">DSFA (Días sin faltas de andrea)</h3>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative min-w-[120px]">
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
            </div>

            <button
                onClick={handleReset}
                disabled={loading}
                className="cyber-button flex items-center gap-2 mt-2 text-xs bg-red-500/20 !text-red-500 border border-red-500/50 hover:bg-red-500/40"
            >
                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                RESETEAR (FALTÓ HOY)
            </button>

            {missingDates.length > 0 && (
                <div className="mt-4 text-left w-full max-w-xs">
                    <span className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">Fechas de falta:</span>
                    <ul className="list-disc list-inside text-[12px] text-zinc-300 font-mono">
                        {missingDates.map((d, idx) => (
                            <li key={idx}>{d}</li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-tighter">
                Status: {days === 0 ? "⚠️ ALERTA: ANDREA FALTO" : "✅ SE ENCUENTRA OPERATIVA"}
            </p>
        </div>
    )
}
