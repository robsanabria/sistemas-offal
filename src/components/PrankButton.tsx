'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Volume2, Skull } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
    const [clicked, setClicked] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // 🔊 Lista global de sonidos
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

    // 🔊 Reproductor reutilizable
    const playSound = (src: string) => {
        try {
            if (
                audioRef.current &&
                !audioRef.current.paused &&
                audioRef.current.src &&
                audioRef.current.src.includes(src)
            ) return

            if (audioRef.current) {
                try {
                    if (!audioRef.current.src.includes(src)) {
                        audioRef.current.pause()
                        audioRef.current.currentTime = 0
                        audioRef.current = null
                    }
                } catch {}
            }

            const audio = new Audio(encodeURI(src))
            audio.volume = 1.0

            audio.onended = () => {
                try {
                    if (audioRef.current === audio) audioRef.current = null
                } catch {}
            }

            audioRef.current = audio
            audio.play().catch(() => {})
        } catch {}
    }

    const handlePrank = () => {
        setClicked(true)
        const idx = Math.floor(Math.random() * sounds.length)
        playSound(sounds[idx])
        setTimeout(() => setClicked(false), 5000)
    }

    const getLabel = (s: string) =>
        s.replace(/\//g, '').replace(/\.(mp3|mpeg|wav|ogg)$/i, '')

    return (
        <div className="cyber-card border-red-500/20 bg-red-500/2 overflow-hidden relative group">

            <div className="flex items-center gap-2 text-red-500 mb-4 font-mono text-[10px] uppercase">
                <AlertTriangle size={14} className="animate-pulse" />
                <span>Strictly Restricted Area</span>
            </div>

            <div className="flex flex-col items-center">

                {/* BOTÓN PRINCIPAL */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrank}
                    className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
                        clicked ? 'bg-red-600 border-white' : 'bg-zinc-900 border-red-600'
                    }`}
                >
                    {clicked ? <Skull size={48} /> : <Volume2 size={32} />}
                </motion.button>

                {/* 🔹 BOTONES RÁPIDOS (se mantienen) */}
                <div className="mt-6 w-full">
                    <h4 className="text-[10px] text-zinc-500 mb-2">Rápidos</h4>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            '/ay-despacito.mp3',
                            '/eu-bata.mp3',
                            '/gogogo-meme.mp3',
                            '/justicia-por-el-padre.mp3',
                            '/oh-my-god-meme.mp3',
                            '/agarrate-los-pantalones.mp3'
                        ].map((s) => (
                            <button
                                key={s}
                                onClick={() => playSound(s)}
                                className="px-2 py-2 text-[11px] bg-zinc-900 border rounded"
                            >
                                {getLabel(s)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🔥 NUEVA GRILLA SCROLLEABLE */}
                <div className="mt-6 w-full">
                    <h4 className="text-[10px] text-zinc-500 mb-2">Todos los sonidos</h4>

                    <div className="max-h-40 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                            {sounds.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => playSound(s)}
                                    className="px-2 py-2 text-[10px] bg-zinc-900/60 border rounded truncate"
                                >
                                    {getLabel(s)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}