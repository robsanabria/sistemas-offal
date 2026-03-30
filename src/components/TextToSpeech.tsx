'use client'

import { useEffect, useState } from 'react'
import { Volume2, Play, Pause, Square } from 'lucide-react'

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [rate, setRate] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices()
      setVoices(v)
      if (v.length > 0) setSelectedVoice(v[0].name)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const speak = () => {
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find(v => v.name === selectedVoice)

    if (voice) utterance.voice = voice
    utterance.rate = rate

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
  }

  const pause = () => speechSynthesis.pause()
  const resume = () => speechSynthesis.resume()
  const stop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="cyber-card flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-cyan-400">
        <Volume2 size={22} />
        <h3 className="font-bold uppercase text-sm tracking-widest">
          TEXTO A VOZ
        </h3>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Escribí algo para que lo diga..."
        className="w-full h-24 p-2 bg-zinc-900 border border-zinc-700 rounded text-sm"
      />

      {/* Voice selector */}
      <select
        value={selectedVoice}
        onChange={e => setSelectedVoice(e.target.value)}
        className="bg-zinc-900 border border-zinc-700 p-2 rounded text-sm"
      >
        {voices.map(v => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>

      {/* Speed */}
      <div>
        <label className="text-xs text-zinc-500">Velocidad: {rate.toFixed(1)}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={e => setRate(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button onClick={speak} className="cyber-button flex-1 flex items-center justify-center gap-2">
          <Play size={16} /> Play
        </button>

        <button onClick={pause} className="cyber-button flex-1 flex items-center justify-center gap-2">
          <Pause size={16} /> Pause
        </button>

        <button onClick={stop} className="cyber-button flex-1 flex items-center justify-center gap-2">
          <Square size={16} /> Stop
        </button>
      </div>

    </div>
  )
}