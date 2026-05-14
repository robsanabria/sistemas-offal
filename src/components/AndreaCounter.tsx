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
        <div className="glass-card flex flex-col items-center justify-center gap-6 text-center relative overflow-hidden group min-h-[320px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={80} />
            </div>

            <div className="space-y-1">
                <h3 className="font-black uppercase tracking-[0.2em] text-xs text-cyan-400/80">Protocolo DSFA</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Días sin faltas de Andrea</p>
            </div>

            <div className="relative">
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
                            className="text-9xl font-black tracking-tighter gradient-text drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                            {days}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black tracking-widest hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw size={14} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    RESETEAR SISTEMA
                </button>

                <div className="flex flex-col items-center gap-1">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${days === 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {days === 0 ? "⚠️ Alerta de Inactividad" : "✅ Unidad Operativa"}
                    </span>
                </div>
            </div>

            {missingDates.length > 0 && (
                <div className="w-full pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase mb-2">
                        <span>Historial de Incidentes</span>
                        <span>{missingDates.length} registros</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center max-h-20 overflow-y-auto custom-scrollbar px-2">
                        {missingDates.slice(-5).map((d, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/5 rounded text-[9px] text-zinc-400 font-mono">
                                {d}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
