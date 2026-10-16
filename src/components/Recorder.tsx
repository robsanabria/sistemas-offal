'use client'

import { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { Mic, Square, Check, X, Play } from 'lucide-react'

const MAX_SECONDS = 15

type Phase = 'idle' | 'recording' | 'naming'

// Graba del micrófono con MediaRecorder y entrega el blob para sumarlo como pad.
export default function Recorder({ onSave }: { onSave: (blob: Blob, name: string) => Promise<void> }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(0)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLAudioElement | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  // false en SSR, resuelto en el cliente (evita el mismatch de hidratación)
  const supported = useSyncExternalStore(
    () => () => {},
    () => 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia,
    () => false
  )

  // contador y tope de duración
  useEffect(() => {
    if (phase !== 'recording') return
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [phase])
  useEffect(() => {
    if (phase === 'recording' && seconds >= MAX_SECONDS && recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [seconds, phase])

  useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current) }, [])

  const start = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t))
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const b = new Blob(chunksRef.current, { type: rec.mimeType })
        setBlob(b)
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = URL.createObjectURL(b)
        setName(`Grabación ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`)
        setPhase('naming')
      }
      recorderRef.current = rec
      rec.start()
      setSeconds(0)
      setPhase('recording')
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')
      setError(denied ? 'Sin permiso para usar el micrófono' : 'No se pudo acceder al micrófono')
      setPhase('idle')
    }
  }

  const stop = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  const discard = () => {
    setBlob(null)
    setPhase('idle')
  }

  const save = async () => {
    if (!blob) return
    await onSave(blob, name)
    discard()
  }

  const playPreview = () => {
    if (!previewUrlRef.current) return
    previewRef.current?.pause()
    previewRef.current = new Audio(previewUrlRef.current)
    previewRef.current.play().catch(() => {})
  }

  if (!supported) return null

  if (phase === 'recording') {
    return (
      <button
        onClick={stop}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-red-500/15 border-red-500/40 text-red-300 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
        title="Detener la grabación"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <Square size={12} fill="currentColor" />
        <span className="font-mono normal-case tracking-normal">0:{String(seconds).padStart(2, '0')} / 0:{MAX_SECONDS}</span>
      </button>
    )
  }

  if (phase === 'naming') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border bg-white/5 border-cyan-400/40">
        <button onClick={playPreview} className="p-1 text-cyan-300 hover:text-white" title="Escuchar">
          <Play size={14} fill="currentColor" />
        </button>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') discard() }}
          maxLength={40}
          placeholder="Nombre del pad"
          className="bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600 w-36"
        />
        <button onClick={save} className="p-1 text-emerald-400 hover:text-emerald-300" title="Guardar como pad (Enter)">
          <Check size={16} />
        </button>
        <button onClick={discard} className="p-1 text-zinc-500 hover:text-zinc-300" title="Descartar (Esc)">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={start}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
        title={`Grabar un audio con el micrófono (máx. ${MAX_SECONDS} s). Queda solo en este navegador por 24 h.`}
      >
        <Mic size={14} /> Grabar
      </button>
      {error && <span className="text-[10px] text-amber-400">{error}</span>}
    </div>
  )
}
