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
        <div className="cyber-card flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-magenta-500">
                    <Coffee size={24} className="text-[#ff00ff]" />
                    <h3 className="font-bold uppercase tracking-widest text-sm text-[#ff00ff]">QUIEN BATE EL CAFE HOY!?</h3>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 text-xs font-mono">
                    <Users size={14} />
                    <span>SISTEMAS-OFFL</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
                <p className="text-zinc-500 text-xs uppercase mb-2">El elegido es:</p>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="text-4xl font-black text-zinc-800 italic"
                        >
                            SELECTING...
                        </motion.div>
                    ) : (
                        <motion.div
                            key={maker}
                            initial={{ y: 20, opacity: 0, rotate: -2 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            className="text-5xl font-black text-white bg-zinc-800 px-6 py-2 border-l-4 border-[#ff00ff] shadow-[10px_10px_0_rgba(255,0,255,0.2)]"
                        >
                            {maker?.toUpperCase() || 'NO ONE'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={randomizeMaker}
                onDoubleClick={(e) => { e.preventDefault(); forceAndrea() }}
                disabled={loading}
                className="cyber-button w-full flex items-center justify-center gap-2 !bg-[#ff00ff] !text-white !shadow-[#ff00ff66]"
                title=" doble clic = Andrea"
            >
                <Dices size={20} className={loading ? 'animate-spin' : ''} />
                CLICK ACA PARA CAMBIAR
            </button>

            <p className="text-[10px] text-zinc-600 text-center font-mono uppercase">
                "IMPORTANTE BATIR LUEGO DE AGREGAR EL CAFE"
            </p>
        </div>
    )
}
