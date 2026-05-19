'use client'

import { useEffect, useState, useRef } from 'react'
import { Radio, Volume2, VolumeX, Play, Square, RefreshCw, Copy, Trash2, HelpCircle, Sparkles, Keyboard, Award } from 'lucide-react'

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

// Lista de abreviaturas/mensajes comunes
const PRESETS = [
  { label: 'SOS (Auxilio)', code: '... --- ...', text: 'SOS' },
  { label: 'CQ (Llamada general)', code: '-.-. --.-', text: 'CQ' },
  { label: 'OK (Entendido)', code: '--- -.-', text: 'OK' },
  { label: 'SISTEMAS', code: '... .. ... - . -- .- ...', text: 'SISTEMAS' },
  { label: 'GRACIAS', code: '--. .-. .- -.-. .. .- ...', text: 'GRACIAS' },
  { label: '73 (Saludos)', code: '--... ...--', text: '73' }
]

export default function MorseCoder() {
  // Transmisión (TX)
  const [textInput, setTextInput] = useState('')
  const [morseInput, setMorseInput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackCharIndex, setPlaybackCharIndex] = useState(-1)
  
  // Recepción (RX)
  const [decodedText, setDecodedText] = useState('')
  const [buffer, setBuffer] = useState('')
  const [keyIsPressed, setKeyIsPressed] = useState(false)
  
  // Ajustes de Audio y Velocidad
  const [wpm, setWpm] = useState(15) // Words per minute
  const [frequency, setFrequency] = useState(650) // Hz
  const [isMuted, setIsMuted] = useState(false)
  
  // Feedback visual y estado interno del oscilador
  const [lightActive, setLightActive] = useState(false)
  const [lastDetectedKey, setLastDetectedKey] = useState<'dot' | 'dash' | null>(null)
  
  // Referencias para AudioContext y estados mutables para los EventListeners
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  const isMutedRef = useRef(false)
  const wpmRef = useRef(15)
  const frequencyRef = useRef(650)
  const activeBeepRef = useRef<{ stop: () => void } | null>(null)
  
  // Referencias para la pulsación manual
  const pressStartTimeRef = useRef<number>(0)
  const isSpacePressedRef = useRef(false)
  const manualOscillatorRef = useRef<OscillatorNode | null>(null)
  const manualGainRef = useRef<GainNode | null>(null)
  
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
    wpmRef.current = wpm
    frequencyRef.current = frequency
  }, [isMuted, wpm, frequency])

  useEffect(() => {
    bufferRef.current = buffer
  }, [buffer])

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
      // 1 si la señal está activa (tono encendido), 0 si no
      history.push(activeSignalRef.current ? 1 : 0)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dibujar cuadrícula de fondo retro
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
      ctx.strokeStyle = activeSignalRef.current ? '#34d399' : '#22d3ee' // emerald si está activo, cyan si no
      ctx.lineWidth = 2
      ctx.shadowBlur = activeSignalRef.current ? 12 : 4
      ctx.shadowColor = activeSignalRef.current ? 'rgba(52, 211, 153, 0.6)' : 'rgba(34, 211, 238, 0.3)'
      
      ctx.beginPath()
      for (let i = 0; i < history.length; i++) {
        const val = history[i]
        // 1 (alto) a 20% de altura, 0 (bajo) a 80% de altura
        const y = val === 1 ? canvas.height * 0.25 : canvas.height * 0.75
        const x = i
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevVal = history[i - 1]
          if (prevVal !== val) {
            // Generar la transición cuadrada perfecta vertical
            const prevY = prevVal === 1 ? canvas.height * 0.25 : canvas.height * 0.75
            ctx.lineTo(x, prevY)
          }
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0 // Resetear sombra para no ralentizar el resto
      
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
    
    // Convertir texto a Morse
    const chars = val.toUpperCase().split('')
    const morseArr = chars.map(char => {
      // Normalizar caracteres especiales comunes
      let normalized = char
      if (normalized === 'Ñ') normalized = 'N'
      if (/[ÁÀÂÄ]/i.test(normalized)) normalized = 'A'
      if (/[ÉÈÊË]/i.test(normalized)) normalized = 'E'
      if (/[ÍÌÎÏ]/i.test(normalized)) normalized = 'I'
      if (/[ÓÒÔÖ]/i.test(normalized)) normalized = 'O'
      if (/[ÚÙÛÜ]/i.test(normalized)) normalized = 'U'
      
      return MORSE_DICT[normalized] || ''
    })
    
    // Filtrar caracteres vacíos consecutivos y unir con espacio
    setMorseInput(morseArr.filter(c => c !== '').join(' '))
  }

  // Traducción manual de Morse a texto
  const handleMorseInputChange = (val: string) => {
    setMorseInput(val)
    
    // Convertir Morse a texto
    const words = val.trim().split(/\s{2,}|\//) // Separar por barra o múltiples espacios
    const decodedWords = words.map(word => {
      const letters = word.trim().split(/\s+/)
      return letters
        .map(letter => REVERSE_DICT[letter] || '?')
        .join('')
    })
    setTextInput(decodedWords.join(' '))
  }

  // Generar tono de audio limpio (Web Audio API)
  const playBeep = (ctx: AudioContext, freq: number, duration: number) => {
    if (isMutedRef.current) {
      return { stop: () => {} }
    }
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    // Suavizar principio y fin de la onda para evitar clics acústicos molestos
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

  // Helper para pausas asíncronas
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Detener la reproducción en curso
  const stopPlayback = () => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setPlaybackCharIndex(-1)
    setLightActive(false)
    activeSignalRef.current = false
    if (activeBeepRef.current) {
      activeBeepRef.current.stop()
      activeBeepRef.current = null
    }
  }

  // Reproducir el Código Morse actual
  const startPlayback = async () => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    if (!morseInput.trim()) return

    // Inicializar AudioContext si no existe
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
    
    // Calcular duraciones a partir de WPM
    // Duración de 1 punto (unidad base)
    const dotTime = 1200 / wpmRef.current 
    
    // Separar letras para hacer el seguimiento visual por letras
    const morseTokens = morseInput.trim().split(/\s+/) // e.g. ["....", ".", ".-.."]
    
    for (let i = 0; i < morseTokens.length; i++) {
      if (!isPlayingRef.current) break
      
      const token = morseTokens[i]
      setPlaybackCharIndex(i)
      
      if (token === '/' || token === '|') {
        // Espacio entre palabras (7 unidades base)
        await sleep(dotTime * 7)
        continue
      }
      
      for (let j = 0; j < token.length; j++) {
        if (!isPlayingRef.current) break
        
        const symbol = token[j]
        
        if (symbol === '.') {
          setLightActive(true)
          activeSignalRef.current = true
          const beep = playBeep(ctx, frequencyRef.current, dotTime / 1000)
          activeBeepRef.current = beep
          await sleep(dotTime)
          setLightActive(false)
          activeSignalRef.current = false
        } else if (symbol === '-') {
          setLightActive(true)
          activeSignalRef.current = true
          const beep = playBeep(ctx, frequencyRef.current, (dotTime * 3) / 1000)
          activeBeepRef.current = beep
          await sleep(dotTime * 3)
          setLightActive(false)
          activeSignalRef.current = false
        }
        
        activeBeepRef.current = null
        
        // Espacio entre elementos del mismo carácter (1 unidad base)
        if (j < token.length - 1) {
          await sleep(dotTime)
        }
      }
      
      // Espacio entre letras (3 unidades base; restamos 1 ya esperada al final del símbolo)
      if (i < morseTokens.length - 1) {
        const nextToken = morseTokens[i + 1]
        if (nextToken !== '/' && nextToken !== '|') {
          await sleep(dotTime * 2)
        }
      }
    }

    stopPlayback()
  }

  // --- Lógica del Manipulador Telegráfico Manual ---

  const handleKeyStart = () => {
    // Inicializar AudioContext
    let ctx = audioContextRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Cancelar timeouts de decodificación activos para seguir editando la letra
    if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)

    setKeyIsPressed(true)
    activeSignalRef.current = true
    setLightActive(true)
    pressStartTimeRef.current = Date.now()

    // Reproducir tono continuo
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
      osc.frequency.setValueAtTime(frequencyRef.current, ctx.currentTime)
      
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

    // Detener tono continuo
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

    // Medir la duración del pulso para categorizarlo
    const duration = Date.now() - pressStartTimeRef.current
    if (duration <= 0) return

    // Basado en WPM, calcular duración óptima
    const dotTime = 1200 / wpmRef.current
    const threshold = dotTime * 2.2 // ej: para 15 WPM = 80ms * 2.2 = 176ms

    let symbol = '.'
    if (duration >= threshold) {
      symbol = '-'
      setLastDetectedKey('dash')
    } else {
      setLastDetectedKey('dot')
    }

    // Agregar símbolo al buffer temporal
    setBuffer(prev => prev + symbol)

    // Configurar timeouts para detectar el final de una letra o palabra
    // Fin de letra: silencio de 4.5 unidades de tiempo
    const letterGap = dotTime * 4.5
    letterTimeoutRef.current = setTimeout(() => {
      decodeManualBuffer()
    }, letterGap)
  }

  // Decodificar el buffer acumulado
  const decodeManualBuffer = () => {
    const currentBuffer = bufferRef.current
    if (!currentBuffer) return

    const decodedChar = REVERSE_DICT[currentBuffer] || '?'
    setDecodedText(prev => prev + decodedChar)
    setBuffer('')
    
    // Programar espacio de palabra si el silencio continúa
    const dotTime = 1200 / wpmRef.current
    const wordGap = dotTime * 9.5
    
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
    wordTimeoutRef.current = setTimeout(() => {
      setDecodedText(prev => {
        // Evitar múltiples espacios seguidos
        if (prev.endsWith(' ') || prev.length === 0) return prev
        return prev + ' '
      })
    }, wordGap - (dotTime * 4.5))
  }

  // Manejo de eventos del teclado global (Barra espaciadora)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Ignorar si el usuario está enfocado en cajas de texto
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.tagName === 'SELECT'
        ) {
          return
        }
        
        e.preventDefault() // Evitar scroll
        
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
      
      // Limpiar timeouts al desmontar
      if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
      if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
    }
  }, [])

  // Limpiar receptor manual
  const clearRx = () => {
    setDecodedText('')
    setBuffer('')
    if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current)
  }

  // Copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Cargar preset
  const loadPreset = (preset: typeof PRESETS[0]) => {
    setTextInput(preset.text)
    setMorseInput(preset.code)
  }

  return (
    <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500 max-w-6xl mx-auto">
      
      {/* PANEL CONTROL DE CONFIGURACIÓN GLOBAL */}
      <div className="cyber-card grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-widest uppercase">SYS-MORSE-80</h3>
            <p className="text-zinc-500 text-xs font-mono">ESTADO: ONLINE [RX/TX]</p>
          </div>
        </div>

        {/* WPM Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Velocidad (WPM):</span>
            <span className="text-cyan-400 font-bold">{wpm} WPM</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={wpm}
            onChange={(e) => setWpm(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>5 WPM (Lento)</span>
            <span>Unidad base: {Math.round(1200 / wpm)}ms</span>
            <span>30 WPM (Rápido)</span>
          </div>
        </div>

        {/* Frequency Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Tono (Hz):</span>
            <span className="text-cyan-400 font-bold">{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="400"
            max="1000"
            step="50"
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>400 Hz (Grave)</span>
            <span>CW Pitch</span>
            <span>1000 Hz (Agudo)</span>
          </div>
        </div>

        {/* Mute and Indicator */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isMuted ? 'MUTEADO' : 'AUDIO ON'}</span>
          </button>
          
          {/* Virtual LED Indicator */}
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-[10px] text-zinc-500 font-mono mb-1">LED</span>
            <div
              className={`w-8 h-8 rounded-full transition-all duration-75 border-2 shadow-lg ${
                lightActive
                  ? 'bg-cyan-400 border-cyan-200 shadow-cyan-400/50 scale-110'
                  : 'bg-zinc-950 border-zinc-800 shadow-transparent'
              }`}
            />
          </div>
        </div>
      </div>

      {/* DUAL TRANSMISIÓN / RECEPCIÓN Y VISUALIZADOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL DE TRANSMISIÓN (TEXT -> MORSE) */}
        <div className="cyber-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Play size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider font-mono">TRANSMISOR (TX)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Texto a Morse
              </span>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">Texto en Español:</label>
                <textarea
                  value={textInput}
                  onChange={(e) => handleTextInputChange(e.target.value)}
                  placeholder="Escribe el mensaje para transmitir..."
                  disabled={isPlaying}
                  className="w-full h-24 p-3 bg-zinc-950/70 border border-zinc-800 focus:border-cyan-500/40 rounded-xl text-sm font-sans focus:outline-none transition-colors resize-none placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block flex justify-between">
                  <span>Código Morse Generado:</span>
                  <button
                    onClick={() => copyToClipboard(morseInput)}
                    className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    title="Copiar Código Morse"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                </label>
                <div className="w-full h-24 p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl font-mono text-base overflow-y-auto break-all selection:bg-cyan-500/20">
                  {morseInput ? (
                    morseInput.split(/\s+/).map((word, idx) => {
                      const isWordActive = idx === playbackCharIndex
                      return (
                        <span
                          key={idx}
                          className={`inline-block mr-2 px-0.5 rounded transition-all duration-100 ${
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
                    <span className="text-zinc-700 italic text-sm">El código Morse se generará aquí...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 font-mono block">MENSAJES PREDETERMINADOS:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => loadPreset(preset)}
                    disabled={isPlaying}
                    className="px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Play controls */}
            <div className="flex gap-3">
              <button
                onClick={startPlayback}
                disabled={!morseInput.trim()}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold border transition-all duration-300 ${
                  isPlaying
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-40 disabled:pointer-events-none'
                }`}
              >
                {isPlaying ? <Square size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'DETENER' : 'REPRODUCIR CÓDIGO MORSE'}</span>
              </button>

              <button
                onClick={() => {
                  setTextInput('')
                  setMorseInput('')
                  stopPlayback()
                }}
                disabled={!textInput && !morseInput}
                className="px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-500 hover:text-white transition-colors"
                title="Limpiar"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* PANEL DE RECEPCIÓN (TELEG-KEY -> TEXT) */}
        <div className="cyber-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Keyboard size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider font-mono">RECEPTOR MANUAL (RX)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Decodificador a Texto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              
              {/* Telegraph Key Container */}
              <div className="flex flex-col items-center justify-center bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 relative min-h-[190px]">
                <div className="text-[10px] text-zinc-500 font-mono absolute top-2 left-3">
                  MANIPULADOR TELEGRÁFICO
                </div>
                
                {/* Visual buffer */}
                <div className="absolute top-2 right-3 font-mono text-xs flex gap-2">
                  <span className="text-zinc-500">Buffer:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 min-w-[30px] text-center">
                    {buffer || '...'}
                  </span>
                  {buffer && (
                    <span className="text-yellow-400 font-bold">
                      → {REVERSE_DICT[buffer] || '?'}
                    </span>
                  )}
                </div>

                {/* Animated Telegraph Key component */}
                <button
                  onMouseDown={handleKeyStart}
                  onMouseUp={handleKeyEnd}
                  onMouseLeave={() => { if (keyIsPressed) handleKeyEnd() }}
                  onTouchStart={(e) => { e.preventDefault(); handleKeyStart(); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleKeyEnd(); }}
                  className="relative group focus:outline-none py-6 select-none"
                  style={{ touchAction: 'none' }}
                >
                  {/* Base of Key */}
                  <div className="w-28 h-6 bg-zinc-800 rounded-lg border border-zinc-700 shadow-md flex items-center justify-center relative">
                    {/* Metal arm pivot */}
                    <div className="absolute bottom-2 left-6 w-3 h-5 bg-zinc-600 rounded-sm border border-zinc-500" />
                    
                    {/* Visual contact point */}
                    <div className="absolute top-0 right-8 w-2 h-2 bg-yellow-600 border border-yellow-500 rounded-full" />
                  </div>
                  
                  {/* Lever / Key Arm */}
                  <div 
                    className={`absolute left-8 bottom-8 origin-left transition-transform duration-75 ${
                      keyIsPressed ? 'rotate-3 translate-y-[2px]' : '-rotate-3'
                    }`}
                  >
                    {/* Metal bar */}
                    <div className="w-16 h-2 bg-zinc-500 rounded-sm border border-zinc-400 relative">
                      {/* Black Knob / Button */}
                      <div className="absolute -top-3 -right-2 w-7 h-7 bg-zinc-950 group-hover:bg-zinc-900 rounded-full border border-zinc-700 shadow-lg flex items-center justify-center cursor-pointer">
                        <div className="w-3 h-3 bg-zinc-800 rounded-full" />
                      </div>
                    </div>
                  </div>
                </button>

                <div className="text-[10px] text-zinc-500 font-mono text-center max-w-[200px] mt-2">
                  Haz click sostenido sobre el botón o presiona la <span className="text-zinc-300 font-bold">Barra Espaciadora</span> (fuera de campos de texto).
                </div>
              </div>

              {/* Quick Input Helper and Instructions */}
              <div className="flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-2 uppercase">Ayuda de Entrada</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setBuffer(prev => prev + '.')
                        if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
                        const dotTime = 1200 / wpm
                        letterTimeoutRef.current = setTimeout(decodeManualBuffer, dotTime * 4.5)
                      }}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                    >
                      Punto (.)
                    </button>
                    <button
                      onClick={() => {
                        setBuffer(prev => prev + '-')
                        if (letterTimeoutRef.current) clearTimeout(letterTimeoutRef.current)
                        const dotTime = 1200 / wpm
                        letterTimeoutRef.current = setTimeout(decodeManualBuffer, dotTime * 4.5)
                      }}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                    >
                      Raya (-)
                    </button>
                    <button
                      onClick={() => {
                        decodeManualBuffer()
                        setDecodedText(prev => prev + ' ')
                      }}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                    >
                      Espacio (/)
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="text-[10px] text-zinc-400 font-mono leading-relaxed space-y-1">
                    <p className="flex justify-between"><span className="text-zinc-600">Punto:</span> <span>&lt; {Math.round((1200/wpm) * 2.2)}ms</span></p>
                    <p className="flex justify-between"><span className="text-zinc-600">Raya:</span> <span>&ge; {Math.round((1200/wpm) * 2.2)}ms</span></p>
                    <p className="flex justify-between"><span className="text-zinc-600">Fin Letra:</span> <span>{Math.round((1200/wpm) * 4.5)}ms de silencio</span></p>
                  </div>
                </div>
              </div>

            </div>

            {/* Decoded Output */}
            <div className="mt-4">
              <label className="text-xs text-zinc-400 font-mono mb-1 block flex justify-between">
                <span>Mensaje Decodificado (RX):</span>
                {decodedText && (
                  <button
                    onClick={() => copyToClipboard(decodedText)}
                    className="text-emerald-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    title="Copiar Mensaje"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                )}
              </label>
              <div className="w-full h-20 p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl font-mono text-base text-emerald-400 overflow-y-auto break-all relative">
                {decodedText ? (
                  decodedText
                ) : (
                  <span className="text-zinc-700 italic text-sm font-sans">El mensaje captado aparecerá aquí mientras manipulas la señal...</span>
                )}
                {/* Blink cursor */}
                {keyIsPressed && <span className="inline-block w-2.5 h-4 bg-emerald-400 ml-0.5 animate-pulse" />}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              onClick={clearRx}
              disabled={!decodedText && !buffer}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 size={16} />
              <span>LIMPIAR DECODIFICADOR</span>
            </button>
            <button
              onClick={() => {
                if (decodedText.length > 0) {
                  setDecodedText(prev => prev.slice(0, -1))
                }
              }}
              disabled={!decodedText}
              className="px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Borrar último carácter"
            >
              Retroceso
            </button>
          </div>
        </div>

      </div>

      {/* OSCILOSCOPIO DIGITAL DE SEÑAL */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider">ANALIZADOR DE SEÑAL DE PORTADORA (CW)</h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">DIBUJO EN TIEMPO REAL</span>
        </div>
        <div className="w-full bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900">
          <canvas
            ref={canvasRef}
            width={720}
            height={100}
            className="w-full h-[100px] block"
          />
        </div>
      </div>

      {/* ACORDEÓN / CHEAT SHEET MORSE */}
      <div className="cyber-card">
        <div className="flex items-center gap-2 text-cyan-400 mb-4 border-b border-white/5 pb-3">
          <HelpCircle size={18} />
          <h3 className="font-bold uppercase text-sm tracking-wider font-mono">GUÍA DE REFERENCIA RÁPIDA (CÓDIGO MORSE)</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs font-mono">
          {/* Agrupar por categorías */}
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

        {/* Números y símbolos */}
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
