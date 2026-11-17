"use client"

import { useEffect, useState } from 'react'

// El aguinaldo (SAC) se paga en dos partes por año: la 1.ª vence el 30 de junio
// y la 2.ª el 18 de diciembre. El chip cuenta hacia la próxima y pasa sola a la siguiente.
const PARTES = [
  { parte: '1.ª', mes: 5, dia: 30 },
  { parte: '2.ª', mes: 11, dia: 18 },
]
const RECORDATORIO = 'El aguinaldo se paga en dos partes: la 1.ª el 30 de junio y la 2.ª el 18 de diciembre.'
const DIA_MS = 24 * 60 * 60 * 1000
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

const pad = (n: number) => String(n).padStart(2, '0')

// Próxima fecha de pago; el mismo día todavía cuenta como "hoy se cobra"
function proxima(ahora: number) {
  const anio = new Date(ahora).getFullYear()
  for (const a of [anio, anio + 1]) {
    for (const p of PARTES) {
      const fecha = new Date(a, p.mes, p.dia)
      if (fecha.getTime() + DIA_MS > ahora) return { parte: p.parte, fecha }
    }
  }
  return { parte: PARTES[0].parte, fecha: new Date(anio + 1, PARTES[0].mes, PARTES[0].dia) }
}

export default function Aguinaldo({ accent = '#4ade80' }: { accent?: string }) {
  // null hasta montar: evita el mismatch de hidratación
  const [ahora, setAhora] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setAhora(Date.now())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 1000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [])

  const prox = ahora === null ? null : proxima(ahora)
  const falta = prox && ahora !== null ? prox.fecha.getTime() - ahora : 0
  const hoy = !!prox && falta <= 0
  const dias = Math.floor(falta / DIA_MS)
  const reloj = `${pad(Math.floor((falta / 3_600_000) % 24))}:${pad(Math.floor((falta / 60_000) % 60))}:${pad(Math.floor((falta / 1000) % 60))}`
  const cuando = prox ? `${DIAS[prox.fecha.getDay()]} ${prox.fecha.getDate()}/${prox.fecha.getMonth() + 1}` : ''

  return (
    <div
      role="timer"
      aria-label="Cuenta regresiva para el aguinaldo"
      title={`${RECORDATORIO}${prox ? ` Próxima: ${prox.parte} parte, ${cuando}.` : ''}`}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap"
    >
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>Aguinaldo</span>
        <span className="text-[10px] text-zinc-400">{prox ? `${prox.parte} parte de 2 · ${cuando}` : 'se paga en 2 partes'}</span>
      </span>
      {hoy ? (
        <span className="text-sm font-extrabold text-zinc-100">¡Hoy se cobra!</span>
      ) : (
        <span className="flex items-baseline gap-1.5 tabular-nums">
          <span className="text-lg font-extrabold leading-none text-zinc-100">{prox ? dias : '–'}</span>
          <span className="text-[11px] text-zinc-400">{dias === 1 ? 'día' : 'días'}</span>
          <span className="text-sm font-mono text-zinc-300">{prox ? reloj : '--:--:--'}</span>
        </span>
      )}
    </div>
  )
}
