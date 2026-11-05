"use client"

import { useEffect, useState } from 'react'

// Feriados nacionales de lo que queda de 2026 (mes 0-indexado).
// Fuera de la cuenta: 10/11 (solo CABA y Córdoba), 11/11 (solo provincia de
// Buenos Aires) y 7/12 (día no laborable puente, optativo).
const FERIADOS: { date: Date; name: string }[] = [
  { date: new Date(2026, 10, 9), name: 'Visita del Papa' },
  { date: new Date(2026, 10, 23), name: 'Soberanía Nacional' },
  { date: new Date(2026, 11, 8), name: 'Inmaculada Concepción' },
  { date: new Date(2026, 11, 25), name: 'Navidad' },
]

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const fmt = (d: Date) => `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`

const DETALLE =
  FERIADOS.map((f) => `${fmt(f.date)} — ${f.name}`).join('\n') +
  '\n\nAparte: mar 10/11 (solo CABA y Córdoba), mié 11/11 (solo prov. de Buenos Aires) y lun 7/12 (no laborable puente).'

export default function FeriadosRestantes({ accent = '#a78bfa' }: { accent?: string }) {
  // null hasta montar: evita el mismatch de hidratación
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 60_000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [])

  // un feriado cuenta como "queda" hasta que termina ese día
  const restantes = now === null ? [] : FERIADOS.filter((f) => f.date.getTime() + 24 * 60 * 60 * 1000 > now)
  const proximo = restantes[0]

  return (
    <div
      title={DETALLE}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap"
    >
      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Feriados 2026</span>
      <span className="text-lg font-extrabold leading-none tabular-nums text-zinc-100">
        {now === null ? '–' : restantes.length}
      </span>
      <span className="text-[11px] text-zinc-400">
        {restantes.length === 1 ? 'queda' : 'quedan'}
        {proximo && <span className="hidden sm:inline"> · próximo {fmt(proximo.date)} ({proximo.name})</span>}
      </span>
    </div>
  )
}
