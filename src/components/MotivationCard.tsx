'use client'

import { useState, useEffect } from 'react'
import { Quote, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OFFICE_MANTRAS = [
    "Planta de influencers.",
    "Miiiiija.",
    "Es como una milanesa pero sin empanar.",
    "Maaaati",
    "Plaata ariel",
    "eLubeer",
    "Abuelo con miedo, se encierra con dos trabas",
    "Que te pensas? QUe el hombre es un indigena?",
    "Essto es chequeado, vomitado y recien levantado.",
    "Amigoooooo"
]

export default function MotivationCard() {
    const [mantra, setMantra] = useState('')

    useEffect(() => {
        const randomMantra = OFFICE_MANTRAS[Math.floor(Math.random() * OFFICE_MANTRAS.length)]
        setMantra(randomMantra)
    }, [])

    // image for monthly visitor
    const VISIT_IMAGE = '/conAbel.jpeg' // actual file extension in public folder
    const [zoomed, setZoomed] = useState(false)

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

            {/* Visita del mes */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
                <h4 className="font-bold uppercase tracking-widest text-sm text-cyan-400 mb-2">Visita del mes</h4>
                <div className="w-full flex justify-center">
                    <img
                        src={VISIT_IMAGE}
                        alt="La visita del mes: Abel"
                        className="max-w-full max-h-48 object-contain rounded-lg shadow-lg cursor-zoom-in"
                        onClick={() => setZoomed(true)}
                    />
                </div>
            </div>

            {zoomed && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 cursor-zoom-out"
                    onClick={() => setZoomed(false)}
                >
                    <img src={VISIT_IMAGE} alt="La visita del mes ampliada" className="max-w-full max-h-full" />
                </div>
            )}
        </div>
    )
}
