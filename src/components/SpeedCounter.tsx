'use client'

import { useState, useEffect } from 'react'
import { Zap, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SpeedCounter() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/counters/speeds')
            .then(res => res.json())
            .then(data => {
                setCount(data.count)
                setLoading(false)
            })
    }, [])

    const updateCount = async (delta: number) => {
        setLoading(true)
        const res = await fetch('/api/counters/speeds', {
            method: 'POST',
            body: JSON.stringify({ delta }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        setCount(data.count)
        setLoading(false)
    }

    return (
        <div className="glass-card flex flex-col items-center justify-center gap-6 text-center relative overflow-hidden group min-h-[320px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} fill="currentColor" className="text-yellow-400" />
            </div>

            <div className="space-y-1">
                <h3 className="font-black uppercase tracking-[0.2em] text-xs text-yellow-400/80">Suministro de Energía</h3>
                <p className="text-[10px] text-zinc-500 font-mono italic">"Protocolo Alas Activado"</p>
            </div>

            <div className="flex items-center gap-8 z-10">
                <button
                    onClick={() => updateCount(-1)}
                    disabled={loading || (count ?? 0) <= 0}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition-all active:scale-90"
                >
                    <Minus size={24} />
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
                                key={count}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            >
                                {count}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => updateCount(1)}
                    disabled={loading}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-yellow-400 hover:border-yellow-400/30 transition-all active:scale-90"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="pt-4 w-full flex justify-center">
                <div className="px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-bold text-yellow-400 tracking-widest uppercase">
                    Unidades Consumidas
                </div>
            </div>
        </div>
    )
}
