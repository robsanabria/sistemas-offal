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

// ── Categorías (color por tipo de audio) ─────────────────────────
type Category = { id: string; label: string; color: string }

const CATEGORIES: Record<string, Category> = {
  frases:  { id: 'frases',  label: 'Frases',  color: '#38bdf8' }, // cyan (default)
  futbol:  { id: 'futbol',  label: 'Fútbol',  color: '#4ade80' }, // verde
  famosos: { id: 'famosos', label: 'Famosos', color: '#f472b6' }, // rosa
  memes:   { id: 'memes',   label: 'Memes',   color: '#fbbf24' }, // ámbar
  fx:      { id: 'fx',      label: 'FX',      color: '#f87171' }, // rojo
  oficina: { id: 'oficina', label: 'Oficina', color: '#a78bfa' }, // violeta
}

// Reglas en orden de prioridad: la primera que matchea gana. El resto cae en "frases".
const CATEGORY_RULES: { cat: string; kws: RegExp }[] = [
  { cat: 'fx',      kws: /fart|pedo|mear|burp|aplauso|latigo|antorcha|sirena|impacto|waska|paquetazo|reverb|sound-effect|gemid|troll|rizz/i },
  { cat: 'futbol',  kws: /boca|river|messi|maradona|\bgol\b|faraona|dibu|getafe/i },
  { cat: 'oficina', kws: /andrea|oscar|abel|inunda|choripan|revivan-el-server|buenas-tardes-grupo|buenos-dias-estrellitas|andas-con-frio/i },
  { cat: 'famosos', kws: /fort|ricardo|moria|capusot|pappo|jelinek|milei|oriana|junco|jovani|nadia|chabona|canosa|michael|jackson|bieber|nestor|soraya|nelson|homero|karina|aristoteles|manteca-alonso|pendejita|trambolico|ciruja/i },
  { cat: 'memes',   kws: /meme|tiktok|oh-my-god|oh-no|gogogo|omg|despacito|bgc|hell-nah|mercadopago|y2mate|nuevo-sonido/i },
]

// Overrides explícitos por nombre de archivo (para la tanda de efectos/memes).
const CATEGORY_OVERRIDES: Record<string, string> = {
  // Memes / voces
  'teletransporte-dragon-ball': 'memes', 'anime-wow': 'memes', 'daddy-chill': 'memes',
  'alerta-metal-gear': 'memes', 'resbalon-de-goofy': 'memes', 'fierro-cayendo': 'memes',
  'aughhh': 'memes', 'hey-mujer': 'memes', 'nerd': 'memes', 'okay-vamos': 'memes',
  // FX / ruidos
  'alarma-roja': 'fx', 'campana-de-box': 'fx', 'acorde': 'fx', 'risa-malvada': 'fx',
  'puerta': 'fx', 'escopeta': 'fx', 'escopeta-2': 'fx', 'fanfarria': 'fx',
  'chicos-festejando': 'fx', 'pedo-con-beso': 'fx', 'desaparecer': 'fx', 'pacman-blinky': 'fx',
  'toque-caricatura': 'fx', 'notificacion-windows': 'fx', 'ack': 'fx', 'diarrea-nuclear': 'fx',
  'eructo-con-pedo': 'fx', 'golpe': 'fx', 'boing': 'fx', 'mordida-caricatura': 'fx',
  'granada-flash': 'fx', 'ak47': 'fx', 'vaca-muu': 'fx', 'aplausos-boton': 'fx',
  'pedo-meme': 'fx', 'golpean-la-puerta': 'fx', 'suspenso': 'fx', 'risa-de-nena': 'fx',
  'pistola': 'fx', 'mordisco': 'fx', 'buzzer-error': 'fx', 'celebracion': 'fx',
  'tirar-la-cadena': 'fx', 'pajaritos': 'fx', 'laser-dancehall': 'fx', 'matasuegras': 'fx',
  'amoladora': 'fx',
}

function categoryFor(src: string): Category {
  const s = decodeURIComponent(src).toLowerCase()
  const base = s.replace(/^\//, '').replace(/\.(mp3|mpeg|wav|ogg)$/i, '')
  if (CATEGORY_OVERRIDES[base]) return CATEGORIES[CATEGORY_OVERRIDES[base]]
  for (const r of CATEGORY_RULES) if (r.kws.test(s)) return CATEGORIES[r.cat]
  return CATEGORIES.frases
}

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
    '/burp-fart.mp3',
    '/long-brain-fart.mp3',
    '/dry-fart.mp3',
    '/fart-with-reverb.mp3',
    '/gano-boca.mp3',
    '/gano-river.mp3',
    '/gallinas-de-rodrigo.mp3',
    '/quiero-drogarme.mp3',
    // Efectos y memes (tanda 2026)
    '/alarma-roja.mp3',
    '/campana-de-box.mp3',
    '/acorde.mp3',
    '/risa-malvada.mp3',
    '/puerta.mp3',
    '/escopeta-2.mp3',
    '/escopeta.mp3',
    '/fanfarria.mp3',
    '/chicos-festejando.mp3',
    '/pedo-con-beso.mp3',
    '/teletransporte-dragon-ball.mp3',
    '/desaparecer.mp3',
    '/pacman-blinky.mp3',
    '/toque-caricatura.mp3',
    '/notificacion-windows.mp3',
    '/anime-wow.mp3',
    '/ack.mp3',
    '/daddy-chill.mp3',
    '/diarrea-nuclear.mp3',
    '/eructo-con-pedo.mp3',
    '/alerta-metal-gear.mp3',
    '/golpe.mp3',
    '/boing.mp3',
    '/mordida-caricatura.mp3',
    '/granada-flash.mp3',
    '/ak47.mp3',
    '/vaca-muu.mp3',
    '/aplausos-boton.mp3',
    '/pedo-meme.mp3',
    '/resbalon-de-goofy.mp3',
    '/golpean-la-puerta.mp3',
    '/fierro-cayendo.mp3',
    '/suspenso.mp3',
    '/risa-de-nena.mp3',
    '/pistola.mp3',
    '/aughhh.mp3',
    '/mordisco.mp3',
    '/buzzer-error.mp3',
    '/celebracion.mp3',
    '/hey-mujer.mp3',
    '/nerd.mp3',
    '/tirar-la-cadena.mp3',
    '/okay-vamos.mp3',
    '/pajaritos.mp3',
    '/laser-dancehall.mp3',
    '/matasuegras.mp3',
    '/amoladora.mp3',
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

      {/* LEYENDA DE CATEGORÍAS */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4">
        {Object.values(CATEGORIES).map((c) => (
          <span key={c.id} className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      {/* GRID DE PADS */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-6 ${expanded ? 'max-h-[calc(100vh-280px)]' : 'max-h-[520px]'}`}>
        {filtered.map((s) => {
          const isActive = activePads.includes(s)
          const isMissing = missingAudios.includes(s)
          const isFav = favorites.includes(s)
          const boundKey = keyForSound[s]
          const isListening = listeningFor === s
          const cat = categoryFor(s)

          return (
            <div
              key={s}
              style={!isMissing ? { borderColor: isActive ? cat.color : undefined } : undefined}
              className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${
                isMissing
                  ? 'bg-zinc-900/40 border-transparent opacity-25'
                  : isListening
                    ? 'bg-cyan-500/15 border-cyan-400/60 ring-2 ring-cyan-400/40'
                    : isActive
                      ? 'bg-white/[0.07] shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {/* Franja de color (categoría) */}
              {!isMissing && (
                <div
                  className="absolute top-0 left-0 h-1 w-full z-10"
                  style={{ background: cat.color, opacity: isActive ? 1 : 0.85 }}
                />
              )}

              {/* Glow inferior (categoría) — visible al hover y fijo al reproducir */}
              {!isMissing && (
                <div
                  aria-hidden
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                    isActive ? 'opacity-25' : 'opacity-0 group-hover:opacity-20'
                  }`}
                  style={{ background: `radial-gradient(120% 55% at 50% 125%, ${cat.color}, transparent 70%)` }}
                />
              )}

              {/* Botón principal: reproducir */}
              <button
                onClick={() => !isMissing && playSound(s)}
                disabled={isMissing}
                className="relative z-10 w-full h-full min-h-[96px] flex flex-col items-center justify-center gap-2 px-2 pt-6 pb-4 disabled:cursor-not-allowed"
                title={`${getLabel(s)} · ${cat.label}`}
              >
                <Play
                  size={18}
                  className={`transition-all ${isActive ? 'scale-125' : 'opacity-60 group-hover:opacity-100'}`}
                  style={{ color: cat.color }}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-[10px] leading-tight font-medium text-center line-clamp-2 ${
                  isActive ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  {getLabel(s)}
                </span>
              </button>

              {/* LED de categoría */}
              {!isMissing && (
                <span
                  aria-hidden
                  className="absolute bottom-1.5 left-1.5 z-10 w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: cat.color,
                    boxShadow: isActive ? `0 0 8px ${cat.color}` : 'none',
                    opacity: isActive ? 1 : 0.55,
                  }}
                />
              )}

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
                    className={`absolute top-1.5 left-1.5 z-20 p-1 rounded-md transition-all ${
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
                    className="absolute top-1.5 right-1.5 z-20 min-w-[20px] h-5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center transition-all border"
                    style={
                      boundKey
                        ? { color: cat.color, borderColor: cat.color, background: `${cat.color}22` }
                        : { borderColor: 'transparent' }
                    }
                    title={boundKey ? `Tecla: ${prettyKey(boundKey)} (click para cambiar)` : 'Asignar tecla'}
                  >
                    <span className={boundKey ? '' : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-cyan-300'}>
                      {boundKey ? prettyKey(boundKey) : <Keyboard size={12} />}
                    </span>
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
