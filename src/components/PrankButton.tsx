'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Volume2, Play } from 'lucide-react'

export default function PrankButton() {
  const [activePads, setActivePads] = useState<string[]>([])
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
          '/nico.mp3',
           '/nico2.mp3',
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
    const random = sounds[Math.floor(Math.random() * sounds.length)]
    playSound(random)
  }

  // keyboard: space or enter triggers main prank when focused; also P key shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      // Ignore when user is typing in inputs, textareas, selects or contenteditable
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return
      }

      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        handlePrank()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [volume, loop])

  return (
    <div className="cyber-card flex flex-col h-full border border-cyan-500/20 bg-zinc-950/80 p-4 rounded-xl relative shadow-[0_0_30px_rgba(0,242,255,0.05)]">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[12px] uppercase font-bold tracking-widest bg-cyan-950/40 px-3 py-1.5 rounded-md border border-cyan-500/30">
            <Volume2 size={16} className="animate-pulse" />
            <span>MPC-OFFAL-V2</span>
          </div>
          
          <button 
            onClick={stopAll}
            className="flex items-center justify-center gap-1 px-4 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/50 rounded-md text-red-500 hover:text-white text-xs font-bold transition-all"
          >
            <AlertTriangle size={14} /> STOP
          </button>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/60 px-4 py-2 rounded-lg border border-zinc-700/50">
          <div className="flex items-center gap-2 text-sm text-cyan-400">
            <Volume2 size={16} />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))} 
              className="w-24 md:w-32 accent-cyan-400"
            />
          </div>
          
          <button
            onClick={() => setLoop(!loop)}
            className={`text-xs px-2 py-1 rounded font-bold transition-all border ${loop ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.4)]' : 'bg-transparent text-zinc-500 border-zinc-600 hover:border-zinc-400'}`}
          >
            LOOP
          </button>
        </div>
      </div>

      {/* MPC PAD GRID */}
      <div className="w-full flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center">
          
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
                className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-75 outline-none
                  ${isMissing 
                    ? 'opacity-20 cursor-not-allowed bg-zinc-900 border-zinc-800' 
                    : isActive
                      ? 'bg-gradient-to-br from-cyan-400 to-green-400 border-2 border-white scale-[0.92] shadow-[0_0_25px_rgba(0,242,255,0.8),inset_0_0_15px_rgba(255,255,255,0.6)] z-10 text-black'
                      : 'bg-zinc-800/80 border border-zinc-700 hover:border-cyan-500/50 hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] shadow-inner text-zinc-400 hover:text-cyan-300 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,255,0.5)]'
                  }
                `}
              >
                {/* Light Indicator Line at top of pad */}
                <span className={`absolute top-0 left-[20%] right-[20%] h-1 rounded-b-md transition-all ${isActive ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-700'}`}></span>
                
                <Play 
                  size={isActive ? 28 : 20} 
                  className={`mt-1 transition-all ${isActive ? 'text-black fill-black' : isMissing ? 'text-zinc-700' : 'text-zinc-500 group-hover:text-cyan-400'}`} 
                />

                <span className={`text-[10px] sm:text-[11px] text-center px-1 font-semibold leading-tight line-clamp-2 w-full $ {isActive ? 'text-black' : ''}`}>
                  {getLabel(s).toUpperCase()}
                </span>

                {/* keyboard hint */}
                {idx < 9 && !isMissing && (
                  <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded-sm ${isActive ? 'bg-black/20 text-black' : 'bg-zinc-700/50 text-zinc-500'}`}>{idx + 1}</span>
                )}
              </button>
            )
          })}
          
        </div>
        
        {missingAudios.length > 0 && (
          <div className="mt-6 text-[10px] text-amber-500/60 font-mono text-center">
            {missingAudios.length} AUDIOS 404 (UNAVAILABLE)
          </div>
        )}
      </div>

    </div>
  )
}