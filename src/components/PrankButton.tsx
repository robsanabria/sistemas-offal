'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const [activePad, setActivePad] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const sounds = [
        '/aaa-se-ha-detectado-un-boliviano.mp3',
        '/agarrate-los-pantalones.mp3',
        '/ahh-despacito-2.mp3',
        '/ahi-lo-tenes-al-pelotudo_TlDTm41.mp3',
        '/alto-guiso.mp3',
        '/atrapada-ayuda.mp3',
        '/ay-despacito.mp3',
        '/bgc-dramatic-music-tiktok-drama-effect-audio-tiktok-new-trend_LYggtlV.mp3',
        '/boca-boca-boca-la-faraona.mp3',
        '/buenas-tardes-grupo.mp3',
        '/buenos-dias-estrellitas.mp3',
        '/capusotto-me-da-uno-de-esos-coso.mp3',
        '/como-llueve.mp3',
        '/creeeo-que-se-equivoco.mp3',
        '/esta-chequeado.mp3',
        '/estoy-cansado-jefe.mp3',
        '/estoy-como-loquita.mp3',
        '/eu-bata-1_VwbftjF.mp3',
        '/eu-bata.mp3',
        '/fiesta-lalala-.mp3',
        '/garganta-profunda.mp3',
        '/gogogo-meme.mp3',
        '/gogogogogogo.mp3',
        '/gogogogo_E2sBNDZ.mp3',
        '/gol-messi-vs-getafe-narrat-per-puyal-full-hd-1080p-audiotrimmer.mp3',
        '/hermoso-hermoso-.mp3',
        '/homero-gimiendo.mp3',
        '/hoy-no-hay-choripan-porque-hay-lluvia-y2save.mp3',
        '/impacto-bendita.mp3',
        '/justicia-por-el-padre.mp3',
        '/le-gustaba-el-fshh-el-chupi-.mp3',
        '/Lo que hay que ver es la producción de Sandra.mp3',
        '/lo-dejo-a-tu-criterio-karina-jelinek-.mp3',
        '/mala-onda-mala-onda.mp3',
        '/michael-jackson-hee-hee.mp3',
        '/naaaa-ta-re-loco-full.mp3',
        '/no-hay-plata.mp3',
        '/oh-my-god-meme.mp3',
        '/oh-no-no-no-tik-tok-song-sound-effect.mp3',
        '/ojhemaflk-omsawt-online-audio-converter.mp3',
        '/paaraaaaa.mp3',
        '/peter-capusotto-la-comida-sanajaja-mp3cut.mp3',
        '/podes-ser-tan-pelotudo-viejo.mp3',
        '/ponele-voluntad.mp3',
        '/por-favor-necesito-pito-me-muero.mp3',
        '/prendo-el-velador-pum-cortocircuito.mp3',
        '/putooo-capusotto.mp3',
        '/que-dificil-me-la-pusiste-diablo.mp3',
        '/que-dios-le-re-bendiga-.mp3',
        '/que-es-eso-bob-esponja.mp3',
        '/que-falta-de-comprension-que-teneees-.mp3',
        '/que-miras-bobo.mp3',
        '/revivan-el-server-homero.mp3',
        '/se-lava-las-manos-.mp3',
        '/tengo-dolares-capusotto.mp3',
        '/tienen-que-cerrar-el-estadio.mp3',
        '/tlabaja-chino.mp3',
        '/tmpsbchnr37.mp3',
        '/todas-divinas-de-que-viven-oriana-junco.mp3',
        '/y2mate_1lLaYg7.mp3',
        '/y2mate_9l5QdzQ (1).mp3',
        '/y2mate_9l5QdzQ.mp3',
        '/WhatsApp-Audio-2026-03-18-at-15.11.05.mp3',
        'ricardo-fort-miameeeeeeeeeeeeee.mp3'
    ]

    const getLabel = (s: string) =>
        s.replace(/\//g, '').replace(/\.(mp3|mpeg|wav|ogg)$/i, '').slice(0, 10)

    const playSound = (src: string) => {
        try {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }

            const audio = new Audio(encodeURI(src))
            audio.volume = 1

            setActivePad(src)

            audio.onended = () => {
                setActivePad(null)
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
        setTimeout(() => setClicked(false), 500)
    }

    return (
        <div className="cyber-card border border-red-500/20 bg-zinc-950 p-4 rounded-xl relative overflow-hidden">

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
                        transition-all duration-300
                        ${clicked
                            ? 'bg-red-600 border-white shadow-[0_0_40px_rgba(255,0,0,0.8)]'
                            : 'bg-zinc-900 border-red-600 hover:border-red-400 shadow-[0_0_25px_rgba(255,0,0,0.25)]'}
                    `}
                >
                    {clicked ? (
                        <Skull size={48} className="text-white animate-bounce" />
                    ) : (
                        <Volume2 size={40} className="text-red-500" />
                    )}
                </motion.button>

                {/* 🎛️ DJ PAD GRID */}
                <div className="mt-6 w-full max-h-72 overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">

                        {sounds.map((s) => {
                            const isActive = activePad === s

                            return (
                                <button
                                    key={s}
                                    onClick={() => playSound(s)}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div
                                        className={`
                                            relative w-16 h-16 rounded-full
                                            bg-gradient-to-b from-red-500 to-red-800
                                            shadow-lg transition-all duration-150

                                            ${isActive
                                                ? 'scale-90 shadow-inner ring-4 ring-white/30 animate-pulse'
                                                : 'hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]'}

                                            before:absolute before:inset-1 before:rounded-full before:bg-black/30
                                            after:absolute after:top-2 after:left-2 after:right-2 after:h-2 after:bg-white/20 after:rounded-full
                                        `}
                                    />

                                    <span className="text-[9px] text-zinc-400 text-center max-w-[60px] truncate">
                                        {getLabel(s)}
                                    </span>
                                </button>
                            )
                        })}

                    </div>
                </div>

            </div>

            {/* EFECTO GLOBAL */}
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