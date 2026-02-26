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
        <div className="cyber-card flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Zap size={24} fill="currentColor" />
                <h3 className="font-bold uppercase tracking-widest text-sm text-yellow-500">CONTADOR DE SPEEDS</h3>
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={() => updateCount(-1)}
                    disabled={loading || (count ?? 0) <= 0}
                    className="p-3 rounded-full border border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-500 transition-colors"
                >
                    <Minus size={24} />
                </button>

                <div className="relative min-w-[100px]">
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
                                key={count}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="text-7xl font-black text-white"
                            >
                                {count}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => updateCount(1)}
                    disabled={loading}
                    className="p-3 rounded-full border border-zinc-700 hover:border-green-500 text-zinc-500 hover:text-green-500 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <p className="text-xs text-zinc-500 mt-2 font-mono italic">
                “te da alas"
            </p>
        </div>
    )
}
