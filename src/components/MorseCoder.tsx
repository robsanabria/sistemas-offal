'use client'

import { useEffect, useState, useRef } from 'react'
import { Radio, Volume2, VolumeX, Play, Square, RefreshCw, Copy, Trash2, HelpCircle, Keyboard, Send, Users, Circle } from 'lucide-react'

// Diccionario de Código Morse
const MORSE_DICT: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': ' '
}

// Diccionario inverso para decodificación
const REVERSE_DICT: Record<string, string> = {}
Object.entries(MORSE_DICT).forEach(([char, code]) => {
  if (code !== ' ') {
    REVERSE_DICT[code] = char
  }
})

const TEAM = ['Roberto', 'Nicolas', 'Andrea', 'Juan', 'Tobias', 'Matias', 'Norber', 'Eze', 'Miguel', 'Luis']

// Lista de abreviaturas/mensajes comunes
const PRESETS = [
  { label: 'SOS (Auxilio)', code: '... --- ...', text: 'SOS' },
  { label: 'CQ (Llamada general)', code: '-.-. --.-', text: 'CQ' },
  { label: 'OK (Entendido)', code: '--- -.-', text: 'OK' },
  { label: 'SISTEMAS', code: '... .. ... - . -- .- ...', text: 'SISTEMAS' },
  { label: 'GRACIAS', code: '--. .-. .- -.-. .. .- ...', text: 'GRACIAS' },
  { label: '73 (Saludos)', code: '--... ...--', text: '73' }
]

interface MorseMessage {
  id?: string
  sender: string
  timestamp?: string
  text: string
  morse: string
  wpm: number
  frequency: number
  isManual: boolean
  pulses?: { type: 'tone' | 'silence'; duration: number }[]
}

export default function MorseCoder() {
  // Configuración del Operador
  const [operator, setOperator] = useState('Roberto')
  const [customOperator, setCustomOperator] = useState('')
  const currentOperator = operator === 'Otro' ? (customOperator || 'Invitado') : operator

  // Transmisión (TX)
  const [textInput, setTextInput] = useState('')
  const [morseInput, setMorseInput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingSender, setPlayingSender] = useState<string | null>(null)
  const [playbackCharIndex, setPlaybackCharIndex] = useState(-1)
  
  // Recepción (RX)
  const [decodedText, setDecodedText] = useState('')
  const [buffer, setBuffer] = useState('')
  const [keyIsPressed, setKeyIsPressed] = useState(false)
  
  // Grabadora de Manipulador (Rhythm Recording)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedPulses, setRecordedPulses] = useState<{ type: 'tone' | 'silence'; duration: number }[]>([])
  
  // Ajustes de Audio y Velocidad
  const [wpm, setWpm] = useState(15) // Words per minute
  const [frequency, setFrequency] = useState(650) // Hz
  const [isMuted, setIsMuted] = useState(false)
  
  // Feed Colaborativo (Canal de Radio)
  const [feedMessages, setFeedMessages] = useState<MorseMessage[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback visual y estado interno del oscilador
  const [lightActive, setLightActive] = useState(false)
  
  // Referencias para AudioContext y estados mutables para los EventListeners
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  const isMutedRef = useRef(false)
  const frequencyRef = useRef(650)
  const activeBeepRef = useRef<{ stop: () => void } | null>(null)
  
  // Referencias para la pulsación manual y grabación de ritmo
  const pressStartTimeRef = useRef<number>(0)
  const lastReleaseTimeRef = useRef<number>(0)
  const isSpacePressedRef = useRef(false)
  const manualOscillatorRef = useRef<OscillatorNode | null>(null)
  const manualGainRef = useRef<GainNode | null>(null)
  const isRecordingRef = useRef(false)
  
  // Referencias para los timeouts de decodificación
  const letterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wordTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const bufferRef = useRef('')
  
  // Canvas para el osciloscopio de señal
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const activeSignalRef = useRef(false)

  // Sincronizar referencias mutables
  useEffect(() => {
    isMutedRef.current = isMuted
    frequencyRef.current = frequency
    isRecordingRef.current = isRecording
  }, [isMuted, frequency, isRecording])

  useEffect(() => {
    bufferRef.current = buffer
  }, [buffer])

  // Obtener mensajes del feed colaborativo
  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/morse')
      const data = await res.json()
      if (data.messages) {
        setFeedMessages(data.messages)
      }
    } catch (e) {
      console.error('Error fetching Morse feed:', e)
    } finally {
      setLoadingFeed(false)
    }
  }

  // Polling del canal de radio cada 5 segundos
  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 5000)
    return () => clearInterval(interval)
  }, [])

  // Inicializar Canvas del osciloscopio
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationFrameId: number
    const history: number[] = new Array(canvas.width).fill(0)
    
    const draw = () => {
      // Desplazar el historial de la señal
      history.shift()
      history.push(activeSignalRef.current ? 1 : 0)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dibujar cuadrícula retro
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      // Dibujar la onda digital
      ctx.strokeStyle = activeSignalRef.current ? '#34d399' : '#22d3ee'
      ctx.lineWidth = 2
      ctx.shadowBlur = activeSignalRef.current ? 12 : 4
      ctx.shadowColor = activeSignalRef.current ? 'rgba(52, 211, 153, 0.6)' : 'rgba(34, 211, 238, 0.3)'
      
      ctx.beginPath()
      for (let i = 0; i < history.length; i++) {
        const val = history[i]
        const y = val === 1 ? canvas.height * 0.25 : canvas.height * 0.75
        const x = i
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevVal = history[i - 1]
          if (prevVal !== val) {
            const prevY = prevVal === 1 ? canvas.height * 0.25 : canvas.height * 0.75
            ctx.lineTo(x, prevY)
          }
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0
      
      animationFrameId = requestAnimationFrame(draw)
    }
    
    draw()
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Auto-traducción en TX
  const handleTextInputChange = (val: string) => {
    setTextInput(val)
    
    const chars = val.toUpperCase().split('')
    const morseArr = chars.map(char => {
      let normalized = char
      if (normalized === 'Ñ') normalized = 'N'
      if (/[ÁÀÂÄ]/i.test(normalized)) normalized = 'A'
      if (/[ÉÈÊË]/i.test(normalized)) normalized = 'E'
      if (/[ÍÌÎÏ]/i.test(normalized)) normalized = 'I'
      if (/[ÓÒÔÖ]/i.test(normalized)) normalized = 'O'
      if (/[ÚÙÛÜ]/i.test(normalized)) normalized = 'U'
      
      return MORSE_DICT[normalized] || ''
    })
    
    setMorseInput(morseArr.filter(c => c !== '').join(' '))
  }

  // Traducción manual de Morse a texto
  const handleMorseInputChange = (val: string) => {
    setMorseInput(val)
    
    const words = val.trim().split(/\s{2,}|\//)
    const decodedWords = words.map(word => {
      const letters = word.trim().split(/\s+/)
      return letters
        .map(letter => REVERSE_DICT[letter] || '?')
        .join('')
    })
    setTextInput(decodedWords.join(' '))
  }

  // Generar tono de audio
  const playBeep = (ctx: AudioContext, freq: number, duration: number) => {
    if (isMutedRef.current) {
      return { stop: () => {} }
    }
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + duration - 0.005)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + duration)
    
    return {
      stop: () => {
        try {
          osc.stop()
          osc.disconnect()
          gain.disconnect()
        } catch (e) {}
      }
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Detener reproducción
  const stopPlayback = () => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setPlayingSender(null)
    setPlaybackCharIndex(-1)
    setLightActive(false)
    activeSignalRef.current = false
    if (activeBeepRef.current) {
      activeBeepRef.current.stop()
      activeBeepRef.current = null
    }
  }

  // Reproducir el Código Morse sintético actual
  const startPlayback = async () => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    if (!morseInput.trim()) return

    let ctx = audioContextRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
    }
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    setIsPlaying(true)
    isPlayingRef.current = true
    setPlayingSender('Sintetizador')
    
    const dotTime = 1200 / wpm
    const morseTokens = morseInput.trim().split(/\s+/)
    
    for (let i = 0; i < morseTokens.length; i++) {
      if (!isPlayingRef.current) break
      
      const token = morseTokens[i]
      setPlaybackCharIndex(i)
      
      if (token === '/' || token === '|') {
        await sleep(dotTime * 7)
        continue
      }
      
      for (let j = 0; j < token.length; j++) {
        if (!isPlayingRef.current) break
        
        const symbol = token[j]
        
        if (symbol === '.') {
          setLightActive(true)
          activeSignalRef.current = true
          const beep = playBeep(ctx, frequency, dotTime / 1000)
          activeBeepRef.current = beep
          await sleep(dotTime)
          setLightActive(false)
          activeSignalRef.current = false
        } else if (symbol === '-') {
          setLightActive(true)
          activeSignalRef.current = true
          const beep = playBeep(ctx, frequency, (dotTime * 3) / 1000)
          activeBeepRef.current = beep
          await sleep(dotTime * 3)
          setLightActive(false)
          activeSignalRef.current = false
        }
        
        activeBeepRef.current = null
        
        if (j < token.length - 1) {
          await sleep(dotTime)
        }
      }
      
      if (i < morseTokens.length - 1) {
        const nextToken = morseTokens[i + 1]
        if (nextToken !== '/' && nextToken !== '|') {
          await sleep(dotTime * 2)
        }
      }
    }

    stopPlayback()
  }

  // Reproducir una grabación de pulsos manuales recibida de otro usuario
  const playPulses = async (pulses: { type: 'tone' | 'silence'; duration: number }[], senderName: string) => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    if (!pulses || pulses.length === 0) return

    let ctx = audioContextRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
    }
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    setIsPlaying(true)
    isPlayingRef.current = true
    setPlayingSender(senderName)

    for (const pulse of pulses) {
      if (!isPlayingRef.current) break

      if (pulse.type === 'tone') {
        setLightActive(true)
        activeSignalRef.current = true
        // Usar la duración exacta guardada en el pulso manual
        const beep = playBeep(ctx, frequency, pulse.duration / 1000)
        activeBeepRef.current = beep
        await sleep(pulse.duration)
        setLightActive(false)
        activeSignalRef.current = false
        activeBeepRef.current = null
      } else {
        // Silencio/intervalo entre beeps
        await sleep(pulse.duration)
      }
    }

    stopPlayback()
  }

  // Enviar mensaje al canal de radio (HTTP POST)
  const transmitToChannel = async (payload: Omit<MorseMessage, 'sender' | 'wpm' | 'frequency'>) => {
    setIsSubmitting(true)
    try {
      const message: MorseMessage = {
        sender: currentOperator,
        wpm,
        frequency,
        ...payload
      }
      
      const res = await fetch('/api/morse', {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        fetchFeed()
        if (payload.isManual) {
          // Si fue manual, limpiar grabación local
          setRecordedPulses([])
        }
      }
    } catch (e) {
      console.error('Error transmitting message:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Lógica del Manipulador Telegráfico ---

  const handleKeyStart = () => {
    let ctx = audioContextRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)

    setKeyIsPressed(true)
    activeSignalRef.current = true
    setLightActive(true)
    
    const now = Date.now()
    pressStartTimeRef.current = now

    // Registrar silencio si estamos grabando y ya había beeps anteriores
    if (isRecordingRef.current && lastReleaseTimeRef.current > 0) {
      const silenceDuration = now - lastReleaseTimeRef.current
      // Filtrar rebotes de menos de 30ms
      if (silenceDuration > 30) {
        setRecordedPulses(prev => [...prev, { type: 'silence', duration: silenceDuration }])
      }
    }

    if (!isMutedRef.current) {
      try {
        if (manualOscillatorRef.current) {
          manualOscillatorRef.current.stop()
          manualOscillatorRef.current.disconnect()
        }
      } catch (e) {}

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      
      manualOscillatorRef.current = osc
      manualGainRef.current = gain
    }
  }

  const handleKeyEnd = () => {
    setKeyIsPressed(false)
    activeSignalRef.current = false
    setLightActive(false)

    const ctx = audioContextRef.current
    const osc = manualOscillatorRef.current
    const gain = manualGainRef.current
    
    if (ctx && osc && gain) {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.01)
        osc.stop(ctx.currentTime + 0.015)
        
        setTimeout(() => {
          try {
            osc.disconnect()
            gain.disconnect()
          } catch(e){}
        }, 50)
      } catch(e){}
    }
    manualOscillatorRef.current = null
    manualGainRef.current = null

    const now = Date.now()
    const duration = now - pressStartTimeRef.current
    if (duration <= 0) return

    lastReleaseTimeRef.current = now

    // Grabar el tono si estamos en modo grabación
    if (isRecordingRef.current) {
      setRecordedPulses(prev => [...prev, { type: 'tone', duration }])
    }

    const dotTime = 1200 / wpm
    const threshold = dotTime * 2.2

    let symbol = '.'
    if (duration >= threshold) {
      symbol = '-'
    }

    setBuffer(prev => prev + symbol)

    const letterGap = dotTime * 4.5
    letterTimeoutRef.current = setTimeout(() => {
      decodeManualBuffer()
    }, letterGap)
  }

  const decodeManualBuffer = () => {
    const currentBuffer = bufferRef.current
    if (!currentBuffer) return

    const decodedChar = REVERSE_DICT[currentBuffer] || '?'
    setDecodedText(prev => prev + decodedChar)
    setBuffer('')
    
    const dotTime = 1200 / wpm
    const wordGap = dotTime * 9.5
    
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
    wordTimeoutRef.current = setTimeout(() => {
      setDecodedText(prev => {
        if (prev.endsWith(' ') || prev.length === 0) return prev
        return prev + ' '
      })
    }, wordGap - (dotTime * 4.5))
  }

  // Teclado global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.tagName === 'SELECT'
        ) {
          return
        }
        
        e.preventDefault()
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true
          handleKeyStart()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.tagName === 'SELECT'
        ) {
          return
        }
        
        e.preventDefault()
        if (isSpacePressedRef.current) {
          isSpacePressedRef.current = false
          handleKeyEnd()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
      if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
    }
  }, [wpm, frequency])

  const clearRx = () => {
    setDecodedText('')
    setBuffer('')
    if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
  }

  const startManualRecording = () => {
    setRecordedPulses([])
    lastReleaseTimeRef.current = 0
    setIsRecording(true)
    clearRx()
  }

  const stopManualRecording = () => {
    setIsRecording(false)
  }

  const transmitRecordedRhythm = () => {
    if (recordedPulses.length === 0) return
    transmitToChannel({
      text: decodedText.trim(),
      morse: recordedPulses.map(p => p.type === 'tone' ? (p.duration > (1200/wpm)*2.2 ? '-' : '.') : ' ').join('').replace(/\s+/g, ' '),
      isManual: true,
      pulses: recordedPulses
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setTextInput(preset.text)
    setMorseInput(preset.code)
  }

  return (
    <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500 max-w-6xl mx-auto">
      
      {/* SECCIÓN OPERADOR / AJUSTES GLOBALES */}
      <div className="cyber-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Identidad del Operador */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Users size={22} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Operador Emisor (Indicativo):</label>
            <div className="flex items-center gap-2">
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-cyan-500/40 p-1.5 rounded-lg text-sm text-zinc-300 font-bold focus:outline-none"
              >
                {TEAM.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
                <option value="Otro">Otro...</option>
              </select>
              
              {operator === 'Otro' && (
                <input
                  type="text"
                  placeholder="Tu indicativo/nombre..."
                  value={customOperator}
                  onChange={(e) => setCustomOperator(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 focus:border-cyan-500/40 px-2 py-1 rounded-lg text-xs text-zinc-300 font-mono focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Reproductor Activo banner */}
        {isPlaying && (
          <div className="flex items-center gap-3 px-4 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono text-cyan-300">
              {playingSender === 'Sintetizador' 
                ? '🔊 MONITOREANDO GENERADOR LOCAL...'
                : `🔊 ESCUCHANDO MENSAJE DE: ${playingSender?.toUpperCase()}`}
            </span>
          </div>
        )}

        {/* Configuración Rápida de Sonido */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-mono">CW LED</span>
            <div
              className={`w-6 h-6 rounded-full transition-all duration-75 border border-zinc-700 shadow-md ${
                lightActive
                  ? 'bg-cyan-400 shadow-cyan-400/50 scale-105'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            />
          </div>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
            }`}
            title={isMuted ? 'Activar Sonido' : 'Mutear Sonido'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

      </div>

      {/* CONTROLES DE FRECUENCIA Y WPM */}
      <div className="cyber-card grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WPM Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Velocidad de Portadora (WPM):</span>
            <span className="text-cyan-400 font-bold">{wpm} WPM</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={wpm}
            onChange={(e) => setWpm(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>5 WPM (Estilo Libre)</span>
            <span>Ref. Punto: {Math.round(1200 / wpm)}ms</span>
            <span>30 WPM (Militar)</span>
          </div>
        </div>

        {/* Frequency Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Tono de Audio (CW Freq):</span>
            <span className="text-cyan-400 font-bold">{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="400"
            max="950"
            step="50"
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>400 Hz (Grave)</span>
            <span>Rango de tono sugerido</span>
            <span>950 Hz (Agudo)</span>
          </div>
        </div>
      </div>

      {/* DUAL TRANSMISIÓN / RECEPCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TRANSMISOR (TX) */}
        <div className="cyber-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Play size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider font-mono">TRANSMISOR LOCAL (TX)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Estación de Generación
              </span>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">Redactar Mensaje:</label>
                <textarea
                  value={textInput}
                  onChange={(e) => handleTextInputChange(e.target.value)}
                  placeholder="Escribe el mensaje en español y se traducirá a morse de forma instantánea..."
                  disabled={isPlaying}
                  className="w-full h-20 p-3 bg-zinc-950/70 border border-zinc-800 focus:border-cyan-500/40 rounded-xl text-sm font-sans focus:outline-none transition-colors resize-none placeholder-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block flex justify-between">
                  <span>Código Morse Generado:</span>
                  <button
                    onClick={() => copyToClipboard(morseInput)}
                    className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                </label>
                <div className="w-full h-20 p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl font-mono text-base overflow-y-auto break-all selection:bg-cyan-500/20">
                  {morseInput ? (
                    morseInput.split(/\s+/).map((word, idx) => {
                      const isWordActive = idx === playbackCharIndex
                      return (
                        <span
                          key={idx}
                          className={`inline-block mr-2 px-0.5 rounded transition-all duration-75 ${
                            isWordActive
                              ? 'bg-cyan-400 text-zinc-950 font-bold scale-105 shadow-md shadow-cyan-400/20'
                              : 'text-zinc-300'
                          }`}
                        >
                          {word}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-zinc-700 italic text-sm font-sans">Escribe arriba para codificar...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {/* Presets */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono block">PLANTILLAS TELEGRÁFICAS:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => loadPreset(preset)}
                    disabled={isPlaying}
                    className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-md text-xs font-mono text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Play controls */}
            <div className="flex gap-2">
              <button
                onClick={startPlayback}
                disabled={!morseInput.trim() || (isPlaying && playingSender !== 'Sintetizador')}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  isPlaying && playingSender === 'Sintetizador'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none'
                }`}
              >
                {isPlaying && playingSender === 'Sintetizador' ? <Square size={14} /> : <Play size={14} />}
                <span>{isPlaying && playingSender === 'Sintetizador' ? 'DETENER MONITOREO' : 'PROBAR TONOS'}</span>
              </button>

              <button
                onClick={() => transmitToChannel({ text: textInput.trim(), morse: morseInput.trim(), isManual: false })}
                disabled={!morseInput.trim() || isSubmitting || isPlaying}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send size={14} />
                <span>{isSubmitting ? 'ENVIANDO...' : 'TRANSMITIR AL EQUIPO'}</span>
              </button>

              <button
                onClick={() => {
                  setTextInput('')
                  setMorseInput('')
                  stopPlayback()
                }}
                disabled={!textInput && !morseInput}
                className="px-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
                title="Limpiar"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* RECEPTOR MANUAL (RX) Y GRABADOR DE RITMO */}
        <div className="cyber-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Keyboard size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider font-mono">CAPTURA DE SEÑAL Y GRABACIÓN (RX)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Telegrafía Activa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              
              {/* Telegraph Key */}
              <div className="flex flex-col items-center justify-center bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 relative min-h-[170px]">
                <div className="text-[10px] text-zinc-500 font-mono absolute top-2 left-3">
                  PULSOS MANUALES
                </div>
                
                {/* Visual buffer */}
                <div className="absolute top-2 right-3 font-mono text-xs flex gap-1.5">
                  <span className="text-zinc-500">Buffer:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 min-w-[24px] text-center">
                    {buffer || '...'}
                  </span>
                  {buffer && (
                    <span className="text-yellow-400 font-bold">
                      → {REVERSE_DICT[buffer] || '?'}
                    </span>
                  )}
                </div>

                <button
                  onMouseDown={handleKeyStart}
                  onMouseUp={handleKeyEnd}
                  onMouseLeave={() => { if (keyIsPressed) handleKeyEnd() }}
                  onTouchStart={(e) => { e.preventDefault(); handleKeyStart(); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleKeyEnd(); }}
                  className="relative group focus:outline-none py-6 select-none"
                  style={{ touchAction: 'none' }}
                >
                  <div className="w-24 h-5 bg-zinc-800 rounded-lg border border-zinc-700 shadow-md flex items-center justify-center relative">
                    <div className="absolute bottom-1.5 left-5 w-2.5 h-4.5 bg-zinc-600 rounded-sm border border-zinc-500" />
                    <div className="absolute top-0 right-6 w-1.5 h-1.5 bg-yellow-600 border border-yellow-500 rounded-full" />
                  </div>
                  
                  <div 
                    className={`absolute left-7 bottom-7 origin-left transition-transform duration-75 ${
                      keyIsPressed ? 'rotate-3 translate-y-[2px]' : '-rotate-3'
                    }`}
                  >
                    <div className="w-14 h-1.5 bg-zinc-500 rounded-sm border border-zinc-400 relative">
                      <div className="absolute -top-3 -right-2.5 w-6.5 h-6.5 bg-zinc-950 group-hover:bg-zinc-900 rounded-full border border-zinc-700 shadow-lg flex items-center justify-center cursor-pointer">
                        <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full" />
                      </div>
                    </div>
                  </div>
                </button>

                <div className="text-[9px] text-zinc-500 font-mono text-center max-w-[200px] mt-1.5">
                  Haz click/tap arriba o usa la <span className="text-zinc-300 font-bold">Barra Espaciadora</span>.
                </div>
              </div>

              {/* Recording Box */}
              <div className="flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">GRABACIÓN RÍTMICA</span>
                    {isRecording ? (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                      </span>
                    ) : null}
                  </div>

                  {isRecording ? (
                    <div className="text-xs space-y-1.5 font-mono">
                      <div className="text-red-400 font-bold animate-pulse">🔴 GRABANDO PULSOS...</div>
                      <div className="text-zinc-400">Pulsos registrados: <span className="text-white font-bold">{recordedPulses.length}</span></div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 space-y-1 font-sans">
                      <p>Graba tu propio ritmo manual ("fist") con pausas reales y envíalo a tus compañeros.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-850 flex gap-2">
                  {isRecording ? (
                    <>
                      <button
                        onClick={stopManualRecording}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all"
                      >
                        Pausar/Parar
                      </button>
                      <button
                        onClick={() => { setIsRecording(false); setRecordedPulses([]); }}
                        className="px-2 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 rounded-lg text-xs font-mono"
                        title="Descartar"
                      >
                        Descartar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startManualRecording}
                      disabled={isPlaying}
                      className="w-full py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:border-red-500/40 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-40"
                    >
                      🔴 EMPEZAR GRABACIÓN
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Decoded manual text */}
            <div className="mt-4">
              <label className="text-xs text-zinc-400 font-mono mb-1 block flex justify-between">
                <span>Traducción Manual en Tiempo Real (RX):</span>
                {decodedText && (
                  <button
                    onClick={() => copyToClipboard(decodedText)}
                    className="text-emerald-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                )}
              </label>
              <div className="w-full h-16 p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl font-mono text-base text-emerald-400 overflow-y-auto break-all relative">
                {decodedText ? (
                  decodedText
                ) : (
                  <span className="text-zinc-700 italic text-sm font-sans">Los caracteres decodificados se irán plasmando aquí...</span>
                )}
                {keyIsPressed && <span className="inline-block w-2.5 h-4 bg-emerald-400 ml-0.5 animate-pulse" />}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-white/5">
            {/* Si tiene pulsos grabados y no está grabando, puede enviarlo */}
            {recordedPulses.length > 0 && !isRecording ? (
              <button
                onClick={transmitRecordedRhythm}
                disabled={isSubmitting || isPlaying}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all"
              >
                <Send size={14} />
                <span>COMPARTIR GRABACIÓN ({recordedPulses.length} PULSOS)</span>
              </button>
            ) : (
              <button
                onClick={clearRx}
                disabled={!decodedText && !buffer}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
              >
                <Trash2 size={14} />
                <span>LIMPIAR PANTALLA</span>
              </button>
            )}

            <button
              onClick={() => {
                if (decodedText.length > 0) {
                  setDecodedText(prev => prev.slice(0, -1))
                }
              }}
              disabled={!decodedText}
              className="px-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-400 text-xs hover:text-white transition-colors disabled:opacity-40"
            >
              Borrar
            </button>
          </div>
        </div>

      </div>

      {/* CANAL DE RADIO: TRANSMISIONES DEL EQUIPO */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-yellow-400">
            <Users size={18} />
            <h4 className="font-mono text-sm font-bold uppercase tracking-wider">CANAL COLABORATIVO: CW-40 (HISTORIAL)</h4>
          </div>
          <button
            onClick={fetchFeed}
            className="text-zinc-500 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        {loadingFeed ? (
          <div className="text-center py-6 text-zinc-500 text-xs font-mono animate-pulse">
            SINTONIZANDO CANAL DE RADIO EN LÍNEA...
          </div>
        ) : feedMessages.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-sm font-mono italic">
            Ninguna transmisión en el canal. ¡Sé el primero en transmitir una señal Morse!
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar">
            {feedMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="p-3 bg-zinc-950/60 hover:bg-zinc-900/60 border border-zinc-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-zinc-900 rounded text-xs font-bold text-zinc-300 border border-zinc-800">
                      📟 {msg.sender}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {msg.timestamp}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border uppercase ${
                      msg.isManual
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {msg.isManual ? '🖐️ Ritmo manual' : `🖥️ Sintético (${msg.wpm} WPM)`}
                    </span>
                  </div>
                  
                  <div className="font-mono text-zinc-300 text-xs break-all tracking-widest bg-zinc-950/30 p-1.5 rounded border border-zinc-950">
                    {msg.morse}
                  </div>
                  
                  {msg.text && (
                    <div className="text-xs text-zinc-400 italic">
                      Mensaje: <span className="text-zinc-300 font-medium">"{msg.text}"</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-stretch sm:self-center sm:min-w-[140px] justify-end">
                  <button
                    onClick={() => {
                      if (msg.isManual && msg.pulses) {
                        playPulses(msg.pulses, msg.sender)
                      } else {
                        // Cargar en TX temporal y reproducir
                        setMorseInput(msg.morse)
                        setTextInput(msg.text)
                        
                        // Esperar un render para reproducir con el valor actualizado
                        setTimeout(() => {
                          startPlayback()
                        }, 50)
                      }
                    }}
                    disabled={isPlaying && playingSender !== msg.sender}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      isPlaying && playingSender === msg.sender
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 hover:border-yellow-500/30 disabled:opacity-40'
                    }`}
                  >
                    {isPlaying && playingSender === msg.sender ? <Square size={12} /> : <Play size={12} />}
                    <span>{isPlaying && playingSender === msg.sender ? 'Parar' : 'Escuchar'}</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(msg.morse)}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-colors"
                    title="Copiar Código Morse"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OSCILOSCOPIO DIGITAL DE SEÑAL */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider">ANALIZADOR DE PORTADORA EN TIEMPO REAL (CW OSCILLOSCOPE)</h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">DIBUJO DE ONDA</span>
        </div>
        <div className="w-full bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900">
          <canvas
            ref={canvasRef}
            width={720}
            height={90}
            className="w-full h-[90px] block"
          />
        </div>
      </div>

      {/* GUÍA DE REFERENCIA RÁPIDA */}
      <div className="cyber-card">
        <div className="flex items-center gap-2 text-cyan-400 mb-4 border-b border-white/5 pb-3">
          <HelpCircle size={18} />
          <h3 className="font-bold uppercase text-sm tracking-wider font-mono">DICCIONARIO RÁPIDO DE CÓDIGO MORSE</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs font-mono">
          {Object.entries(MORSE_DICT)
            .filter(([char]) => char !== ' ' && char.match(/[A-Z]/))
            .map(([char, code]) => (
              <div 
                key={char} 
                className="flex justify-between items-center bg-zinc-950/30 hover:bg-zinc-950/60 p-2 rounded border border-zinc-900/60 transition-colors cursor-default"
                onClick={() => {
                  setTextInput(prev => prev + char)
                  handleTextInputChange(textInput + char)
                }}
                title="Añadir a la transmisión"
              >
                <span className="text-zinc-500 font-bold">{char}</span>
                <span className="text-cyan-400 tracking-wider font-extrabold">{code}</span>
              </div>
            ))}
        </div>

        <div className="border-t border-white/5 mt-4 pt-4">
          <span className="text-[10px] text-zinc-500 font-mono block mb-2">NÚMEROS Y SÍMBOLOS:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs font-mono">
            {Object.entries(MORSE_DICT)
              .filter(([char]) => char !== ' ' && !char.match(/[A-Z]/))
              .map(([char, code]) => (
                <div 
                  key={char} 
                  className="flex justify-between items-center bg-zinc-950/30 hover:bg-zinc-950/60 p-2 rounded border border-zinc-900/60 transition-colors cursor-default"
                  onClick={() => {
                    setTextInput(prev => prev + char)
                    handleTextInputChange(textInput + char)
                  }}
                  title="Añadir a la transmisión"
                >
                  <span className="text-zinc-500 font-bold">{char === ' ' ? 'Espacio' : char}</span>
                  <span className="text-emerald-400 tracking-wider font-extrabold">{code}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  )
}
