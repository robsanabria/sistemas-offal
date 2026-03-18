'use client'

import { useState, useEffect } from 'react'
import { Quote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OFFICE_MANTRAS = [
    "Planta de influencers.",
    "Miiiiija.",
    "Es como una milanesa pero sin empanar.",
    "Maaaati",
    "Plaata ariel, plata",
    "eLubeer",
    "Abuelo con miedo, se encierra con dos trabas",
    "Que te pensas? QUe el hombre es un indigena?",
    "Essto es chequeado, vomitado y recien levantado.",
    "Amigoooooo",
    "La paja motoneta",
    "AAaa que cobraba",
    "Eso no va a pasar.",
    "Andó",
    "Pendrivers",
    "Chinchulandia",
    "Chinchudata",
    "Lo que hay que ver, es la producción de Sandra",
    "Se me cerro el ani",
    "Como se llama la hija de Twins?"
]

export default function MotivationCard() {
    const [mantra, setMantra] = useState('')

    useEffect(() => {
        const randomMantra = OFFICE_MANTRAS[Math.floor(Math.random() * OFFICE_MANTRAS.length)]
        setMantra(randomMantra)
    }, [])

    // images for monthly visitor carousel (served from /public)
    const VISIT_IMAGES = [
        '/05ac4b22-b5e6-42ca-aca5-5e2b0997dadf.jpg',
        '/658ad0a2-7c16-4182-b78e-aab7d49499a2.jpg',
        '/fb49da52-7c3a-4746-ba6f-3669f82ac4f6.jpg',
        '/conAbel.jpeg',
        '/100626621_123695632676472_1536639118396620800_n.jpg',
    ]
    const [visitIndex, setVisitIndex] = useState(0)
    const [zoomed, setZoomed] = useState(false)

    const prevVisit = () => setVisitIndex((i) => (i - 1 + VISIT_IMAGES.length) % VISIT_IMAGES.length)
    const nextVisit = () => setVisitIndex((i) => (i + 1) % VISIT_IMAGES.length)

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
                <div className="w-full flex justify-center relative">
                    <button
                        aria-label="Anterior"
                        onClick={prevVisit}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full"
                    >
                        <ChevronLeft size={18} className="text-white" />
                    </button>

                    <img
                        src={VISIT_IMAGES[visitIndex]}
                        alt={`La visita del mes ${visitIndex + 1}`}
                        className="max-w-full max-h-48 object-contain rounded-lg shadow-lg cursor-zoom-in"
                        onClick={() => setZoomed(true)}
                    />

                    <button
                        aria-label="Siguiente"
                        onClick={nextVisit}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 rounded-full"
                    >
                        <ChevronRight size={18} className="text-white" />
                    </button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {VISIT_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setVisitIndex(idx)}
                                className={`w-2 h-2 rounded-full ${idx === visitIndex ? 'bg-cyan-400' : 'bg-zinc-700/50'}`}
                                aria-label={`Ir a imagen ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {zoomed && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 cursor-zoom-out"
                    onClick={() => setZoomed(false)}
                >
                    <img src={VISIT_IMAGES[visitIndex]} alt="La visita del mes ampliada" className="max-w-full max-h-full" />
                </div>
            )}
        </div>
    )
}
