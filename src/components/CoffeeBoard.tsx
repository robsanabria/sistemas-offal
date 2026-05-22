'use client'

import { useState, useEffect } from 'react'
import { Coffee, Dices, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CoffeeBoard() {
    const [maker, setMaker] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/board/coffee')
            .then(res => res.json())
            .then(data => {
                setMaker(data.maker)
                setLoading(false)
            })
    }, [])

    const randomizeMaker = async () => {
        setLoading(true)
        const res = await fetch('/api/board/coffee', { method: 'POST' })
        const data = await res.json()
        setMaker(data.maker)
        setLoading(false)
    }

    const forceAndrea = async () => {
        setLoading(true)
        const res = await fetch('/api/board/coffee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ force: 'Andrea' })
        })
        const data = await res.json()
        setMaker(data.maker)
        setLoading(false)
    }

    return (
        <div className="glass-card flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Coffee size={80} />
            </div>

            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Coffee size={20} className="text-pink-400" />
                    <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-pink-400/80">Protocolo Cafeína</h3>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono">
                    <Users size={12} />
                    <span>SISTEMAS-OFFL</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-8 z-10">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-4">Unidad Seleccionada:</p>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="text-3xl font-black text-zinc-800 animate-pulse tracking-tighter"
                        >
                            CALCULANDO...
                        </motion.div>
                    ) : (
                        <motion.div
                            key={maker}
                            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            className="text-5xl font-black text-white bg-white/5 px-8 py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
                                {maker?.toUpperCase() || 'ERROR'}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={randomizeMaker}
                onDoubleClick={(e) => { e.preventDefault(); forceAndrea() }}
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black text-xs tracking-widest shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all active:scale-95 overflow-hidden"
                title="Doble clic para protocolo de emergencia"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Dices size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                <span>EJECUTAR SORTEO</span>
            </button>

            <div className="flex flex-col items-center gap-1 opacity-40">
                <p className="text-[9px] text-zinc-500 text-center font-mono uppercase tracking-tight">
                    "Importante batir luego de agregar el café"
                </p>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
        </div>
    )
}
