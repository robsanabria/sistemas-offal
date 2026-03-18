'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

   const sounds = [
        '/aaa-se-ha-detectado-un-boliviano.mp3',
        '/agarrate-los-pantalones.mp3',
        '/ahh-despacito-2.mp3',
        '/ahi-lo-tenes-al-pelotudo_TlDTm41.mp3',
        '/alto-guiso.mp3',
        '/atrapada-ayuda.mp3',
        '/ay-despacito (3).mp3',
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
        '/nuevo-sonido-1.mp3',
        '/nuevo-sonido-2.mp3',
        '/nuevo-sonido-3.mp3',
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
        '/tlabaja.mp3',
        '/tmpsbchnr37.mp3',
        '/todas-divinas-de-que-viven-oriana-junco.mp3',
        '/y2mate_1lLaYg7.mp3',
        '/y2mate_9l5QdzQ (1).mp3',
        '/y2mate_9l5QdzQ.mp3',
        '/WhatsApp-Audio-2026-03-18-at-15.11.05.mp3'
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
                        shadow-[0_0_25px_rgba(255,0,0,0.25)]
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

                {/* BOTONERA PAD */}
                <div className="mt-6 w-full max-h-64 overflow-y-auto pr-1">
                    <div className="grid grid-cols-4 gap-2">

                        {sounds.map((s) => (
                            <button
                                key={s}
                                onClick={() => playSound(s)}
                                className="
                                    relative
                                    aspect-square
                                    rounded-lg
                                    bg-zinc-900
                                    border border-zinc-700
                                    hover:border-red-500
                                    hover:bg-red-600/20
                                    active:scale-95
                                    active:bg-red-600/40
                                    active:shadow-inner
                                    transition
                                    flex items-center justify-center
                                    group
                                    shadow-[0_0_10px_rgba(0,0,0,0.5)]
                                    hover:shadow-[0_0_12px_rgba(255,0,0,0.4)]
                                "
                            >
                                {/* ICONO */}
                                <svg
                                    className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M3 10v4h4l5 5V5L7 10H3z" />
                                </svg>

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
                        ))}

                    </div>
                </div>

            </div>

            {/* EFECTO */}
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