'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handlePrank = () => {
        setClicked(true)

        // Lista de sonidos dentro de la carpeta `public/` (rutas servidas desde '/')
        const sounds = [
            '/boca-boca-boca-la-faraona.mp3',
            '/buenas-tardes-grupo.mp3',
            '/como-llueve.mp3',
            '/estoy-cansado-jefe.mp3',
            '/gogogogogogo.mp3',
            '/gol-messi-vs-getafe-narrat-per-puyal-full-hd-1080p-audiotrimmer.mp3',
            '/homero-gimiendo.mp3',
            '/ponele-voluntad.mp3',
            '/que-es-eso-bob-esponja.mp3',
            '/revivan-el-server-homero.mp3',
            '/y2mate_1lLaYg7.mp3',
            '/nuevo-sonido-1.mp3',
            '/nuevo-sonido-2.mp3',
            '/nuevo-sonido-3.mp3'
        ]

        const idx = Math.floor(Math.random() * sounds.length)
        const src = sounds[idx]

        try {
            // Pausar cualquier audio previo
            if (audioRef.current) {
                try { audioRef.current.pause() } catch (e) { /* ignore */ }
                audioRef.current = null
            }

            const audio = new Audio(src)
            audio.volume = 1.0
            audioRef.current = audio
            audio.play().catch(e => console.error('Audio play blocked or failed:', e))
        } catch (err) {
            console.error('Audio setup error:', err)
        }

        // Reset visual state after a short delay
        setTimeout(() => setClicked(false), 5000)
    }

    return (
        <div className="cyber-card border-red-500/20 bg-red-500/2 overflow-hidden relative group">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-2 text-red-500 mb-4 font-mono text-[10px] uppercase tracking-tighter">
                <AlertTriangle size={14} className="animate-pulse" />
                <span>Strictly Restricted Area / Personal Autorizado</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrank}
                    className={`
            w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center gap-2
            shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300
            ${clicked ? 'bg-red-600 border-white scale-90' : 'bg-zinc-900 border-red-600 hover:border-red-400'}
          `}
                >
                    {clicked ? (
                        <Skull size={48} className="text-white animate-bounce" />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-red-500">NO TOCAR</span>
                            <Volume2 size={32} className="text-red-500" />
                        </div>
                    )}
                </motion.button>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-zinc-600 font-mono italic">
                        "Este botón no hace nada. No lo presiones."
                    </p>
                </div>
            </div>

            {/* El audio se crea dinámicamente en handlePrank para evitar problemas de autoplay */}

            {clicked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    className="absolute inset-0 bg-red-500 animate-ping pointer-events-none"
                />
            )}
        </div>
    )
}
