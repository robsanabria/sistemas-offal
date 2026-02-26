'use client'

import { useState, useEffect } from 'react'
import { Quote, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OFFICE_MANTRAS = [
    "Planta de influencers.",
    "Miiiiija.",
    "Es como una milanesa pero sin empanar.",
    "Maaaati",
    "Plaata ariel"
]

export default function MotivationCard() {
    const [mantra, setMantra] = useState('')

    useEffect(() => {
        const randomMantra = OFFICE_MANTRAS[Math.floor(Math.random() * OFFICE_MANTRAS.length)]
        setMantra(randomMantra)
    }, [])

    return (
        <div className="cyber-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Sparkles size={80} className="text-cyan-400" />
            </div>

            <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <Quote size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Frase del Día</h3>
            </div>

            <AnimatePresence mode="wait">
                <motion.p
                    key={mantra}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl md:text-2xl font-serif italic text-zinc-100 leading-relaxed"
                >
                    "{mantra}"
                </motion.p>
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-zinc-800" />
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">Sistemicos Offal Mantra</span>
            </div>
        </div>
    )
}
