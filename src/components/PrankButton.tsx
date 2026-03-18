'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const sounds = [
        '/ay-despacito.mp3',
        '/eu-bata.mp3',
        '/gogogo-meme.mp3',
        '/justicia-por-el-padre.mp3',
        '/oh-my-god-meme.mp3',
        '/agarrate-los-pantalones.mp3',
        '/peter-capusoto-la-comida-sanajaja-mp3cut.mp3',
        '/ponele-voluntad.mp3',
        '/prendo-el-velador-pum-cortocircuito.mp3',
        '/putooo-capusotto.mp3',
        '/que-miras-bobo.mp3',
        '/revivan-el-server-homero.mp3',
        '/tengo-dolares-capusotto.mp3',
        '/y2mate_9l5QdzQ.mp3'
    ]

    const getLabel = (s: string) =>
        s
            .replace(/\//g, '')
            .replace(/\.(mp3|mpeg|wav|ogg)$/i, '')
            .slice(0, 10)

    const playSound = (src: string) => {
        try {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }

            const audio = new Audio(encodeURI(src))
            audio.volume = 1.0

            audio.onended = () => {
                if (audioRef.current === audio) {
                    audioRef.current = null
                }
            }

            audioRef.current = audio
            audio.play().catch(() => {})
        } catch (err) {
            console.error(err)
        }
    }

    const handlePrank = () => {
        setClicked(true)

        const random = sounds[Math.floor(Math.random() * sounds.length)]
        playSound(random)

        setTimeout(() => setClicked(false), 2000)
    }

    const icons = [Volume2, Skull, AlertTriangle]

    return (
        <div className="cyber-card border-red-500/20 bg-red-500/5 overflow-hidden relative group p-4 rounded-xl">

            {/* HEADER */}
            <div className="flex items-center gap-2 text-red-500 mb-4 font-mono text-[10px] uppercase tracking-wider">
                <AlertTriangle size={14} className="animate-pulse" />
                <span>STRICTLY RESTRICTED AREA</span>
            </div>

            {/* BOTON CENTRAL */}
            <div className="flex flex-col items-center">

                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrank}
                    className={`
                        w-32 h-32 rounded-full border-4 flex items-center justify-center
                        shadow-[0_0_25px_rgba(255,0,0,0.3)]
                        transition-all duration-300
                        ${clicked
                            ? 'bg-red-600 border-white'
                            : 'bg-zinc-900 border-red-600 hover:border-red-400'}
                    `}
                >
                    {clicked ? (
                        <Skull size={48} className="text-white animate-bounce" />
                    ) : (
                        <Volume2 size={40} className="text-red-500" />
                    )}
                </motion.button>

                {/* BOTONERA */}
                <div className="mt-6 w-full max-h-60 overflow-y-auto pr-1">
                    <div className="grid grid-cols-4 gap-2">

                        {sounds.map((s) => {
                            const Icon = icons[Math.floor(Math.random() * icons.length)]

                            return (
                                <button
                                    key={s}
                                    onClick={() => playSound(s)}
                                    className="
                                        relative
                                        aspect-square
                                        rounded-md
                                        bg-zinc-900
                                        border border-zinc-700
                                        hover:bg-red-600/20
                                        hover:border-red-500
                                        active:scale-95
                                        active:bg-red-600/40
                                        active:shadow-inner
                                        transition
                                        flex items-center justify-center
                                        group
                                        shadow-[0_0_8px_rgba(0,0,0,0.4)]
                                        hover:shadow-[0_0_12px_rgba(255,0,0,0.3)]
                                    "
                                >
                                    {/* ICONO */}
                                    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition" />

                                    {/* LABEL */}
                                    <span className="
                                        absolute bottom-1 left-1 right-1
                                        text-[8px]
                                        text-zinc-500
                                        truncate
                                        text-center
                                        opacity-80
                                    ">
                                        {getLabel(s)}
                                    </span>
                                </button>
                            )
                        })}

                    </div>
                </div>

            </div>

            {/* EFECTO OVERLAY */}
            {clicked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    className="absolute inset-0 bg-red-500 animate-ping pointer-events-none"
                />
            )}
        </div>
    )
}