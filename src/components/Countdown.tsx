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

  const units = [
    { value: ready ? String(days) : '–', label: days === 1 ? 'día' : 'días' },
    { value: ready ? pad(hours) : '--', label: 'horas' },
    { value: ready ? pad(minutes) : '--', label: 'min' },
    { value: ready ? pad(seconds) : '--', label: 'seg' },
  ]

  return (
    <div role="timer" aria-label={`Cuenta regresiva: ${label}`} className="flex flex-col items-center gap-2">
      <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: accent }}>{label}</span>
      {done ? (
        <span className="text-3xl md:text-4xl font-extrabold text-zinc-100">{doneText}</span>
      ) : (
        <div className="flex items-stretch gap-2 md:gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center justify-center min-w-[64px] md:min-w-[84px] px-3 py-2 md:py-3 rounded-2xl bg-white/5 border border-white/10"
            >
              <span className="text-3xl md:text-5xl font-extrabold leading-none tabular-nums text-zinc-100">{u.value}</span>
              <span className="mt-1.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{u.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
