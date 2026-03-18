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
            '/peter-capusoto-la-comida-sanajaja-mp3cut.mp3',
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
            '/y2mate_9l5QdzQ.mp3'
        ]

        const idx = Math.floor(Math.random() * sounds.length)
        const src = sounds[idx]

        // Evitar reproducir dos instancias del mismo audio simultáneamente
        if (audioRef.current && !audioRef.current.paused && audioRef.current.src && audioRef.current.src.includes(src)) {
            console.debug('El mismo audio ya se está reproduciendo, se omite la reproducción:', src)
            return
        }

        try {
            // Pausar cualquier audio previo si es distinto
            if (audioRef.current) {
                try {
                    if (!audioRef.current.src.includes(src)) {
                        audioRef.current.pause()
                        audioRef.current.currentTime = 0
                        audioRef.current = null
                    }
                } catch (e) { /* ignore */ }
            }

            const audio = new Audio(encodeURI(src))
            audio.volume = 1.0
            audio.onended = () => {
                try {
                    if (audioRef.current === audio) audioRef.current = null
                } catch (e) { /* ignore */ }
            }
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
