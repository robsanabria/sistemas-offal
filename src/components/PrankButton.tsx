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
        '/ricardo-fort-miameeeeeeeeeeeeee.mp3',
        '/fort-le-grita-a-su-madre-con-subtitulos.mp3'
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

    {/* CONTENIDO */}
    <div className="flex flex-col items-center">

      {/* 🔴 BOTON CENTRAL PRO */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={handlePrank}
        className="relative flex items-center justify-center cursor-pointer"
      >

        {/* ONDAS */}
        {clicked && (
          <>
            <span className="absolute w-40 h-40 rounded-full border border-red-500/40 animate-ping" />
            <span className="absolute w-40 h-40 rounded-full border border-red-500/20 animate-ping [animation-delay:250ms]" />
          </>
        )}

        {/* BOTON */}
        <div
          className={`
            relative w-36 h-36 rounded-full flex items-center justify-center
            transition-all duration-300

            ${clicked
              ? `
                bg-gradient-to-b from-red-500 to-red-800
                shadow-[inset_0_0_30px_rgba(0,0,0,0.9),0_0_40px_rgba(255,0,0,0.9)]
                scale-95
              `
              : `
                bg-gradient-to-b from-zinc-800 to-zinc-950
                border border-red-600/40
                shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(255,0,0,0.25)]
                hover:shadow-[0_0_40px_rgba(255,0,0,0.6)]
              `
            }

            before:absolute before:inset-2 before:rounded-full before:bg-black/40
            after:absolute after:top-3 after:left-6 after:right-6 after:h-3 after:bg-white/10 after:rounded-full
          `}
        >
          {clicked ? (
            <Skull size={50} className="text-white animate-bounce z-10" />
          ) : (
            <Volume2 size={46} className="text-red-500 z-10" />
          )}
        </div>
      </motion.div>

      {/* 🎛️ DJ PAD GRID */}
      <div className="mt-8 w-full max-h-72 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">

          {sounds.map((s) => {
            const isActive = activePad === s

            return (
              <button
                key={s}
                onClick={() => playSound(s)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`
                    relative w-16 h-16 rounded-full
                    transition-all duration-150

                    ${isActive
                      ? `
                        bg-gradient-to-b from-red-400 to-red-700
                        scale-90
                        shadow-[inset_0_0_15px_rgba(0,0,0,0.9),0_0_25px_rgba(255,0,0,0.8)]
                        ring-2 ring-white/40
                      `
                      : `
                        bg-gradient-to-b from-zinc-700 to-zinc-900
                        shadow-[0_8px_20px_rgba(0,0,0,0.8)]
                        group-hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]
                      `
                    }

                    before:absolute before:inset-1 before:rounded-full before:bg-black/40
                    after:absolute after:top-2 after:left-3 after:right-3 after:h-2 after:bg-white/10 after:rounded-full
                  `}
                />

                <span className="text-[9px] text-zinc-400 text-center max-w-[70px] truncate group-hover:text-red-400 transition">
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
        animate={{ opacity: 0.1 }}
        className="absolute inset-0 bg-red-500 pointer-events-none"
      />
    )}

  </div>
)
}