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
    '/nico.mp3',
    '/nico2.mp3',
    '/manteca-alonso.mp3',
    '/perfect-fart.mp3',
    '/despierta-ya-mujer-gsony.mp3',
    '/gemid-troll.mp3',
    '/bartolito-troll.mp3',
    '/van-a-sortear-el-chancho_1wwbxDg.mp3',
    '/oh-my-god-bro-oh-hell-nah-man.mp3',
    '/mercadopago-transferencia-ok.mp3',
    '/y2mate_7GF5HwI.mp3',
    '/que-rica-cola.mp3',
    '/lo-siento-wilson.mp3',
    '/rizz-sound-effect.mp3',
    '/boliviano.mp3',
    '/paraguayo.mp3',
    '/peruano.mp3',
    '/transexual.mp3',
    '/a-mi.mp3',
    '/que-lindo-vestidito-que-tenes.mp3',
    '/que-miseria.mp3',
    '/tres-empanadas.mp3',
    '/mire.mp3',
    '/soy-mama-canosa.mp3',
    '/toma-pa-vo.mp3',
    '/amoo-milei.mp3',
    '/toda-todaaa.mp3',
    '/anda-a-laburar.mp3',
    '/omg-bruh-oh-hell-nah.mp3',
    '/a-lo-que-yo-vine.mp3',
    '/leche-mucha-leche.mp3',
    '/diego-maradona-eeehhhh.mp3',
    '/podes-ser-tan-pelotudo-viejo.mp3',
    '/antorcha.mp3',
    '/concha-de-tu-madre-no-soy-yo.mp3',
    '/michael_aaow.mp3',
    '/heeheeee.mp3',
    '/michael-jackson-auw-mp3',
    '/oooooohhhh.mp3',
    '/lo-comiste-vos.mp3',
    '/lo-comiste-vos-gordo.mp3',
    '/hay-morrones.mp3',
    '/aplausos.mp3',
    '/ay-miguel.mp3',
    '/latigo.mp3',
    '/nestor-comeme-bien-los-huevos.mp3',
    '/la-chabona-cachorra-de-leche.mp3',
    '/pedo.mp3',
    '/mear-sound.mp3',
    '/andas-con-frio-oscar.mp3'
    '/gracias-conchuda.mp3',
    '/te-la-reconstruyo.mp3',
    '/paquetazo.mp3',
    '/waska-en-la-cara.mp3',
    '/waska-en-la-cara-2.mp3',





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

      audio.play().catch(() => { })
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
    <div className="glass-card !bg-white/5 border-red-500/20 p-8 rounded-2xl relative overflow-hidden min-h-[600px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-[0.3em] mb-1">
            <AlertTriangle size={16} className="animate-pulse" />
            <span>MPC Restricted Protocol</span>
          </div>
          <p className="text-zinc-500 text-[10px] font-mono">Disparador de frecuencias subsónicas y memes</p>
        </div>

        <div className="flex items-center gap-4">
           <button
            onClick={stopAll}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black tracking-widest transition-all active:scale-95"
          >
            STOP ALL
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-zinc-400 transition-all active:scale-95"
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
        
        {/* BOTON CENTRAL LEFT */}
        <div className="flex flex-col items-center gap-8 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrank}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePrank() } }}
            className="relative cursor-pointer group"
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {clicked && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping" />
                <span className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping delay-300" />
              </>
            )}

            <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-500 border-4 shadow-2xl
              ${clicked
                ? 'bg-gradient-to-br from-red-500 to-red-900 border-white/40 scale-90 shadow-red-500/50'
                : 'bg-gradient-to-br from-zinc-800 to-zinc-950 border-white/10 shadow-black group-hover:border-red-500/50'}
            `}>
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
              {clicked
                ? <Skull size={80} className="text-white drop-shadow-2xl animate-bounce" />
                : <Volume2 size={70} className="text-red-500/80 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300" />}
            </div>
          </motion.div>

          <div className="w-full max-w-xs space-y-4">
             <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
              <Volume2 size={16} className="text-zinc-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
            
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auto-Loop</span>
              <button
                onClick={() => setLoop(!loop)}
                className={`w-12 h-6 rounded-full transition-all relative ${loop ? 'bg-red-500/40' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${loop ? 'right-1 bg-red-500' : 'left-1 bg-zinc-600'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* GRID RIGHT */}
        <div className="flex-grow w-full">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Sound Library</h4>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-zinc-500 border border-white/5">{validSounds.length} SAMPLES</span>
            </div>
            {missingAudios.length > 0 && (
              <span className="text-[9px] text-amber-500/80 font-mono">⚠️ {missingAudios.length} OFFLINE</span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar pb-10">
            {sounds.map((s, idx) => {
              const isActive = activePads.includes(s)
              const isMissing = missingAudios.includes(s)

              return (
                <button
                  key={s}
                  onClick={() => !isMissing && playSound(s)}
                  disabled={isMissing}
                  className={`group relative aspect-square rounded-xl transition-all duration-200 border flex flex-col items-center justify-center gap-2
                    ${isMissing ? 'bg-zinc-900/40 border-transparent opacity-20 cursor-not-allowed' : 
                      isActive ? 'bg-red-500/20 border-red-500/50 scale-95 shadow-inner' : 
                      'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 shadow-lg'}
                  `}
                >
                  <Play size={16} className={`${isActive ? 'text-red-400 scale-125' : 'text-zinc-600 group-hover:text-red-400/70'} transition-all`} fill={isActive ? "currentColor" : "none"} />
                  <span className={`text-[8px] font-mono uppercase tracking-tighter text-center px-1 line-clamp-1 ${isActive ? 'text-red-300 font-bold' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                    {getLabel(s)}
                  </span>

                  {idx < 9 && !isMissing && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-zinc-800 border border-white/10 text-[8px] flex items-center justify-center text-zinc-500 font-bold">
                      {idx + 1}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {clicked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          className="absolute inset-0 bg-red-500 pointer-events-none z-50"
        />
      )}
    </div>
  )
}
