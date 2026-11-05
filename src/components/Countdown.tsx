"use client"

import { useEffect, useState } from 'react'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

interface CountdownProps {
  label: string
  target: number        // timestamp en ms
  doneText?: string     // se muestra cuando llega a cero
  accent?: string
}

export default function Countdown({ label, target, doneText = '¡Ya salió!', accent = '#c6f135' }: CountdownProps) {
  // Arranca en null: el server y el primer render del cliente muestran el
  // mismo placeholder, evitando un mismatch de hidratación (React #418).
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 1000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [])

  const ready = now !== null
  const diff = ready ? Math.max(0, target - now) : 0
  const done = ready && diff === 0
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return (
    <div
      role="timer"
      aria-label={`Cuenta regresiva: ${label}`}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap"
    >
      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>{label}</span>
      {done ? (
        <span className="text-sm font-bold text-zinc-100">{doneText}</span>
      ) : (
        <span className="flex items-baseline gap-1.5 tabular-nums">
          <span className="text-lg font-extrabold leading-none text-zinc-100">{ready ? days : '–'}</span>
          <span className="text-[11px] text-zinc-400">{days === 1 ? 'día' : 'días'}</span>
          <span className="text-sm font-mono text-zinc-300">
            {ready ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : '--:--:--'}
          </span>
        </span>
      )}
    </div>
  )
}
