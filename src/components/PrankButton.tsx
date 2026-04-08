'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Volume2, Skull, Maximize2, Minimize2, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrankButton() {
  const [clicked, setClicked] = useState(false)
  const [activePads, setActivePads] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(1)
  const [loop, setLoop] = useState(false)
  const [missingAudios, setMissingAudios] = useState<string[]>([])

  const audioRefs = useRef<HTMLAudioElement[]>([])

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
        '/fort-le-grita-a-su-madre-con-subtitulos.mp3',
        '/video-pono-foto-pono.mp3',
        '/jaja-basta-chicos.mp3',
        '/MAMA-CORTASTES-TODA-LA-LOOZ.mp3',
        '/Justin-Bieber-es-de-piscis.mp3',
        '/andrea-no-te-duermas.mp3',
        '/andrea-no-te-duermas-2.mp3',
        '/ay-por-favor.mpg.mp3',
        '/no-se-inunda-mas.mp3',
        '/andrea-cafe.mp3',
        '/diosito.mp3',
        '/miradequienteburlaste.mp3',
        '/ha-ha-nelson-burla.mp3',
        '/grito-de-soraya.mp3',
        '/que-haces-besando-a-la-lisiada.mp3',
        '/aristoteles-moria.mp3',
        '/moria_uV2J33z.mp3',
        '/eldecorado-moria.mp3',
        '/que-asco-moria.mp3',
        '/nelson-callese.mp3',
        '/zi-zeñoda.mp3',
        '/pappo-porfavor.mp3',
        '/pappo-trabajohonesto.mp3',
        '/nadia-la-cachorra.mp3',
         '/lachabona-estilo.mp3',
         '/imaginate-lachabona.mp3',
         '/lachabona-atodoringtone.mp3',
         '/me-gusta-el-arte.mp3',
          '/voy-a-esperar.mp3',
          '/jovani-desayunaconhuevo.mp3',
          '/jovani-quisieraserunamosca.mp3',
          '/trambolico.mp3',
          '/y-yo-vole.mp3',
          '/pendejita-de22.mp3',
          '/10milguarani.mp3',
          '/megarrodemipelo.mp3',
          '/faaah.mp3',
          '/lalocumbia-enserio.mp3',
          '/pagalaprata.mp3',
          '/nunca.mp3',
          '/ciruja.mp3',
          '/puto-feo-asi.mp3',
          '/tarao-e.mp3',
          '/quevasatirar.mp3',
  ]

  // 🔎 Detectar audios faltantes
  useEffect(() => {
    const checkAudios = async () => {
      const results = await Promise.all(
        sounds.map(async (s) => {
          try {
            const res = await fetch(s, { method: 'HEAD' })
            return res.ok ? null : s
          } catch {
            return s
          }
        })
      )

      setMissingAudios(results.filter(Boolean) as string[])
    }

    checkAudios()
  }, [])

  const validSounds = sounds.filter((s) => !missingAudios.includes(s))

  const getLabel = (s: string) =>
    s.replace(/\//g, '').replace(/\.(mp3|mpeg|wav|ogg)$/i, '').slice(0, 10)

  const playSound = (src: string) => {
    try {
      const audio = new Audio(encodeURI(src))
      audio.volume = volume
      audio.loop = loop

      setActivePads((prev) => [...prev, src])
      audioRefs.current.push(audio)

      audio.onended = () => {
        setActivePads((prev) => prev.filter((p) => p !== src))
        audioRefs.current = audioRefs.current.filter((a) => a !== audio)
      }

      audio.play().catch(() => {})
    } catch (err) {
      console.error(err)
    }
  }

  const stopAll = () => {
    audioRefs.current.forEach((a) => {
      a.pause()
      a.currentTime = 0
    })
    audioRefs.current = []
    setActivePads([])
  }

  const handlePrank = () => {
    setClicked(true)
    const random = sounds[Math.floor(Math.random() * sounds.length)]
    playSound(random)
    setTimeout(() => setClicked(false), 500)
  }

  // keyboard: space or enter triggers main prank when focused; also P key shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        handlePrank()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [volume, loop])

  return (
    <div className="cyber-card border border-red-500/20 bg-zinc-950 p-4 rounded-xl relative overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider">
          <AlertTriangle size={14} className="animate-pulse" />
          <span>STRICTLY RESTRICTED AREA</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-500 hover:text-red-400 transition"
        >
          {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className="flex flex-col items-center w-full">

        {/* BOTON CENTRAL */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePrank}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePrank() } }}
          className="relative cursor-pointer flex items-center justify-center"
        >
          {clicked && (
            <>
              <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
              <span className="absolute inset-0 rounded-full border border-red-500/10 animate-ping delay-200" />
            </>
          )}

          <div className={`relative w-32 md:w-40 lg:w-48 h-32 md:h-40 lg:h-48 rounded-full flex items-center justify-center transition-all duration-300
            ${clicked
              ? 'bg-gradient-to-b from-red-500 to-red-800 scale-95 shadow-[0_0_40px_rgba(255,0,0,0.9)]'
              : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border border-red-600/40 shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:shadow-[0_0_32px_rgba(255,0,0,0.45)]'}
          `}>
            {clicked
              ? <Skull size={44} className="text-white animate-bounce z-10" />
              : <Volume2 size={40} className="text-red-500 z-10" />}
          </div>
        </motion.div>

        {/* CONTROLES PRO */}
        {expanded && (
          <div className="w-full mt-6 cyber-card bg-zinc-900/60 border border-red-500/10 p-3 space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Volumen</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volumen de sonidos"
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Loop</span>
              <button
                onClick={() => setLoop(!loop)}
                aria-pressed={loop}
                className={`px-3 py-1 rounded text-xs ${loop ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}
              >
                {loop ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={stopAll}
              className="w-full py-2 bg-red-700 hover:bg-red-800 rounded text-sm"
            >
              STOP ALL 🔥
            </button>
          </div>
        )}

        {/* GRID */}
        <div className="mt-6 w-full max-h-72 overflow-y-auto pr-2">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">

            {sounds.map((s, idx) => {
              const isActive = activePads.includes(s)
              const isMissing = missingAudios.includes(s)

              return (
                <button
                  key={s}
                  onClick={() => !isMissing && playSound(s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isMissing && playSound(s) } }}
                  aria-label={`Reproducir ${getLabel(s)}`}
                  aria-disabled={isMissing}
                  className={`flex flex-col items-center gap-2 group ${isMissing ? 'opacity-30 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-cyan-400'}`}
                >
                  <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-150
                    ${isActive
                      ? 'bg-gradient-to-b from-red-400 to-red-700 scale-95 shadow-[0_0_18px_rgba(255,0,0,0.8)] ring-2 ring-white/20'
                      : 'bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-[0_6px_16px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_16px_rgba(255,0,0,0.35)]'}
                  `}>

                    <Play
                      size={16}
                      className={`${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-red-400'}`}
                      fill="currentColor"
                    />

                    {isMissing && (
                      <span className="absolute top-1 right-1 text-[9px] text-red-500">
                        404
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-400 text-center max-w-[80px] truncate group-hover:text-red-400 transition">
                    {getLabel(s)}
                  </span>
                </button>
              )
            })}

          </div>
          {missingAudios.length > 0 && (
            <div className="mt-3 text-sm text-amber-400 font-mono">Audios faltantes: {missingAudios.length}</div>
          )}
        </div>
      </div>

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