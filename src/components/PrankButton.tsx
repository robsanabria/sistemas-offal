'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  AlertTriangle, Volume2, VolumeX, Maximize2, Minimize2, Play,
  Search, Star, Keyboard, X, Repeat, Square, Shuffle
} from 'lucide-react'
import { motion } from 'framer-motion'

const BIND_KEY = 'botonera:bindings:v1'
const FAV_KEY = 'botonera:favorites:v1'
const VOL_KEY = 'botonera:volume:v1'

export default function PrankButton() {
  const [clicked, setClicked] = useState(false)
  const [activePads, setActivePads] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(1)
  const [loop, setLoop] = useState(false)
  const [missingAudios, setMissingAudios] = useState<string[]>([])

  // UX state
  const [search, setSearch] = useState('')
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [bindings, setBindings] = useState<Record<string, string>>({}) // key -> src
  const [listeningFor, setListeningFor] = useState<string | null>(null) // src awaiting a key

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
    '/y2mate_7GF5HwI (1).mp3',
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
    '/antorcha.mp3',
    '/concha-de-tu-madre-no-soy-yo.mp3',
    '/michael_aaow.mp3',
    '/heeheeee.mp3',
    '/michael-jackson-auw.mp3',
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
    '/andas-con-frio-oscar.mp3',
    '/gracias-conchuda.mp3',
    '/te-la-reconstruyo.mp3',
    '/paquetazo.mp3',
    '/waska-en-la-cara.mp3',
    '/waska-en-la-cara-2.mp3',
  ]

  // ── Persistencia ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const b = localStorage.getItem(BIND_KEY)
      if (b) setBindings(JSON.parse(b))
      const f = localStorage.getItem(FAV_KEY)
      if (f) setFavorites(JSON.parse(f))
      const v = localStorage.getItem(VOL_KEY)
      if (v !== null) setVolume(Number(v))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(BIND_KEY, JSON.stringify(bindings)) } catch {}
  }, [bindings])
  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)) } catch {}
  }, [favorites])
  useEffect(() => {
    try { localStorage.setItem(VOL_KEY, String(volume)) } catch {}
  }, [volume])

  // ── Detectar audios faltantes ──────────────────────────────────
  useEffect(() => {
    const checkAudios = async () => {
      const results = await Promise.all(
        sounds.map(async (s) => {
          try {
            const res = await fetch(encodeURI(s), { method: 'HEAD' })
            return res.ok ? null : s
          } catch {
            return s
          }
        })
      )
      setMissingAudios(results.filter(Boolean) as string[])
    }
    checkAudios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ────────────────────────────────────────────────────
  const getLabel = (s: string) => {
    const base = decodeURIComponent(s)
      .replace(/^\//, '')
      .replace(/\.(mp3|mpeg|wav|ogg)$/i, '')
    const pretty = base
      .replace(/_[A-Za-z0-9]{6,}$/g, '')        // colas hash tipo _TlDTm41
      .replace(/^y2mate[_\s-]*/i, '')
      .replace(/\b(audiotrimmer|mp3cut|online audio converter|y2save|full hd 1080p)\b/gi, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    // si el limpiado agresivo dejó algo vacío, usamos el nombre crudo legible
    const out = pretty || base.replace(/[_-]+/g, ' ').trim()
    return out.replace(/^\w/, (c) => c.toUpperCase()) || 'Audio'
  }

  const prettyKey = (k: string) =>
    k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k

  // src -> tecla asignada (para mostrar en el pad)
  const keyForSound = useMemo(() => {
    const m: Record<string, string> = {}
    for (const [k, s] of Object.entries(bindings)) m[s] = k
    return m
  }, [bindings])

  const validSounds = sounds.filter((s) => !missingAudios.includes(s))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sounds.filter((s) => {
      if (showFavOnly && !favorites.includes(s)) return false
      if (!q) return true
      return getLabel(s).toLowerCase().includes(q)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showFavOnly, favorites, missingAudios])

  // ── Audio ──────────────────────────────────────────────────────
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
    const pool = validSounds.length ? validSounds : sounds
    const random = pool[Math.floor(Math.random() * pool.length)]
    playSound(random)
    setTimeout(() => setClicked(false), 500)
  }

  // ── Favoritos / Teclas ─────────────────────────────────────────
  const toggleFav = (src: string) =>
    setFavorites((prev) =>
      prev.includes(src) ? prev.filter((p) => p !== src) : [...prev, src]
    )

  const bindKey = (rawKey: string, src: string) => {
    const key = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey
    setBindings((prev) => {
      const next: Record<string, string> = {}
      // una tecla por sonido y un sonido por tecla
      for (const [k, s] of Object.entries(prev)) {
        if (k === key) continue   // libera la tecla de su sonido anterior
        if (s === src) continue   // libera el sonido de su tecla anterior
        next[k] = s
      }
      next[key] = src
      return next
    })
  }

  const clearBinding = (src: string) =>
    setBindings((prev) => {
      const next: Record<string, string> = {}
      for (const [k, s] of Object.entries(prev)) if (s !== src) next[k] = s
      return next
    })

  // ── Teclado global ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return
      }

      // Modo "esperando tecla" para asignar un pad
      if (listeningFor) {
        e.preventDefault()
        if (e.key === 'Escape') { setListeningFor(null); return }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          clearBinding(listeningFor)
          setListeningFor(null)
          return
        }
        bindKey(e.key, listeningFor)
        setListeningFor(null)
        return
      }

      // Atajos globales
      if (e.key === 'Escape') { stopAll(); return }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const src = bindings[key]
      if (src && !missingAudios.includes(src)) {
        e.preventDefault()
        playSound(src)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindings, listeningFor, volume, loop, missingAudios])

  // ── UI ─────────────────────────────────────────────────────────
  return (
    <div className={`glass-card !bg-white/5 border-red-500/20 p-5 md:p-8 rounded-2xl relative overflow-hidden ${expanded ? 'min-h-screen' : 'min-h-[600px]'}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      {/* HEADER */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-[0.3em] mb-1">
            <AlertTriangle size={16} className="animate-pulse" />
            <span>Botonera MPC</span>
          </div>
          <p className="text-zinc-500 text-[11px] font-mono">
            Disparador de audios — asigná teclas y reproducí al toque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrank}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 rounded-xl text-[11px] font-black tracking-widest transition-all active:scale-95"
            title="Reproducir un audio al azar"
          >
            <Shuffle size={14} /> RANDOM
          </button>
          <button
            onClick={stopAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[11px] font-black tracking-widest transition-all active:scale-95"
            title="Detener todo (Esc)"
          >
            <Square size={13} fill="currentColor" /> STOP
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-zinc-400 transition-all active:scale-95"
            title={expanded ? 'Contraer' : 'Expandir'}
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Buscador */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex-grow min-w-[200px] max-w-md focus-within:border-red-500/40 transition-colors">
          <Search size={15} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar audio…"
            className="bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-zinc-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Favoritos */}
        <button
          onClick={() => setShowFavOnly((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
            showFavOnly
              ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
              : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Star size={14} fill={showFavOnly ? 'currentColor' : 'none'} />
          {favorites.length > 0 ? `Favoritos (${favorites.length})` : 'Favoritos'}
        </button>

        {/* Volumen */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 min-w-[160px]">
          <button onClick={() => setVolume(volume > 0 ? 0 : 1)} className="text-zinc-400 hover:text-white shrink-0">
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-[10px] font-mono text-zinc-500 w-8 text-right shrink-0">{Math.round(volume * 100)}%</span>
        </div>

        {/* Loop */}
        <button
          onClick={() => setLoop(!loop)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
            loop
              ? 'bg-red-500/15 border-red-500/40 text-red-300'
              : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title="Repetir el audio en bucle"
        >
          <Repeat size={14} /> Loop
        </button>
      </div>

      {/* META LÍNEA */}
      <div className="flex items-center justify-between mb-4 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
            {filtered.length} / {sounds.length} audios
          </span>
          {Object.keys(bindings).length > 0 && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              {Object.keys(bindings).length} {Object.keys(bindings).length === 1 ? 'tecla asignada' : 'teclas asignadas'}
            </span>
          )}
          {missingAudios.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              ⚠ {missingAudios.length} offline
            </span>
          )}
        </div>
        <span className="text-zinc-600 hidden sm:flex items-center gap-1.5">
          <Keyboard size={12} /> tocá el ⌨ de un pad y apretá una tecla para asignarla
        </span>
      </div>

      {/* GRID DE PADS */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-6 ${expanded ? 'max-h-[calc(100vh-280px)]' : 'max-h-[520px]'}`}>
        {filtered.map((s) => {
          const isActive = activePads.includes(s)
          const isMissing = missingAudios.includes(s)
          const isFav = favorites.includes(s)
          const boundKey = keyForSound[s]
          const isListening = listeningFor === s

          return (
            <div
              key={s}
              className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${
                isMissing
                  ? 'bg-zinc-900/40 border-transparent opacity-25'
                  : isListening
                    ? 'bg-cyan-500/15 border-cyan-400/60 ring-2 ring-cyan-400/40'
                    : isActive
                      ? 'bg-red-500/20 border-red-500/50 shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 shadow-lg'
              }`}
            >
              {/* Botón principal: reproducir */}
              <button
                onClick={() => !isMissing && playSound(s)}
                disabled={isMissing}
                className="w-full h-full min-h-[92px] flex flex-col items-center justify-center gap-2 px-2 pt-6 pb-3 disabled:cursor-not-allowed"
                title={getLabel(s)}
              >
                <Play
                  size={18}
                  className={`transition-all ${isActive ? 'text-red-400 scale-125' : 'text-zinc-600 group-hover:text-red-400/80'}`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-[10px] leading-tight font-medium text-center line-clamp-2 ${
                  isActive ? 'text-red-200' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  {getLabel(s)}
                </span>
              </button>

              {isListening && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cyan-950/85 backdrop-blur-sm text-center px-2">
                  <Keyboard size={20} className="text-cyan-300 mb-1 animate-pulse" />
                  <span className="text-[10px] text-cyan-200 font-bold leading-tight">Apretá una tecla</span>
                  <span className="text-[8px] text-cyan-400/70 mt-1">Esc cancela · Supr borra</span>
                </div>
              )}

              {!isMissing && (
                <>
                  {/* Favorito */}
                  <button
                    onClick={() => toggleFav(s)}
                    className={`absolute top-1.5 left-1.5 z-10 p-1 rounded-md transition-all ${
                      isFav
                        ? 'text-amber-400'
                        : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                    }`}
                    title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  {/* Asignar / mostrar tecla */}
                  <button
                    onClick={() => setListeningFor(isListening ? null : s)}
                    className={`absolute top-1.5 right-1.5 z-10 min-w-[20px] h-5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                      boundKey
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                        : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-cyan-300 border border-transparent'
                    }`}
                    title={boundKey ? `Tecla: ${prettyKey(boundKey)} (click para cambiar)` : 'Asignar tecla'}
                  >
                    {boundKey ? prettyKey(boundKey) : <Keyboard size={12} />}
                  </button>
                </>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm">
            No hay audios que coincidan con “{search}”.
          </div>
        )}
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
