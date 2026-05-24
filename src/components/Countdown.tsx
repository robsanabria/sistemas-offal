"use client"

import { useEffect, useState } from 'react'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export default function Countdown() {
  // FIFA World Cup 2026 starts on June 11, 2026 (UTC)
  const target = new Date(Date.UTC(2026, 5, 11, 0, 0, 0)).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-700/20 via-cyan-800/10 to-transparent border border-white/5 text-center">
        <div className="text-xs text-zinc-400 uppercase font-mono tracking-wide">FIFA World Cup 2026</div>
        <div className="flex items-baseline gap-3 mt-1">
          <div className="text-3xl font-extrabold">{days}</div>
          <div className="text-sm text-zinc-400">días</div>
          <div className="ml-4 text-sm font-medium text-zinc-200">{pad(hours)}:{pad(minutes)}:{pad(seconds)}</div>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">Comienza el 11 de junio de 2026 (UTC)</div>
      </div>
    </div>
  )
}
