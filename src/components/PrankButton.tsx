'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handlePrank = () => {
        setClicked(true)

        // Use a direct trigger which is more likely to work with browser policies
        try {
            const audio = new Audio("https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptoken=88e3c329-873d-4c74-8968-385073041c5c")
            audio.volume = 1.0
            audio.play().catch(e => {
                console.error("Audio block:", e)
                // If it fails, we show a small toast or similar in a real app
            })
        } catch (err) {
            console.error("Audio setup error:", err)
        }

        // Reset after some time
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

            {/* Prank Audio - Placeholder URL: Gemido de WhatsApp/Office Prank */}
            <audio
                ref={audioRef}
                src="https://www.myinstants.com/media/sounds/gemido-de-whatsapp-whatsapp-moan.mp3"
                preload="auto"
            />

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
