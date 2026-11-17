"use client"

import { useEffect, useState, useCallback } from 'react'
import { Pencil, UserX } from 'lucide-react'

interface Persona {
  id: string
  nombre: string
  dias: number
}

// Contadores compartidos de "días sin faltar" de todo Sistemas, ordenados como ranking de quién falta más.
// El estado vive en Redis (/api/asistencia) y avanza solo con los días hábiles.
export default function DiasSinFaltar() {
  const [personas, setPersonas] = useState<Persona[] | null>(null)
  const [error, setError] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/asistencia', { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      setPersonas((await res.json()).personas)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    const first = setTimeout(cargar, 0)
    const t = setInterval(cargar, 60_000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [cargar])

  const guardar = async (payload: Record<string, unknown>) => {
    setGuardando(true)
    try {
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(String(res.status))
      setPersonas((await res.json()).personas)
      setError(false)
    } catch {
      setError(true)
    }
    setGuardando(false)
  }

  const marcarFalta = (p: Persona) => {
    if (window.confirm(`¿${p.nombre} faltó hoy? El contador vuelve a 0.`)) guardar({ persona: p.id, accion: 'falto' })
  }

  const corregir = (p: Persona) => {
    const valor = window.prompt(`Días sin faltar de ${p.nombre}:`, String(p.dias))
    if (valor === null) return
    const dias = Number(valor.trim())
    if (!Number.isInteger(dias) || dias < 0) return
    guardar({ persona: p.id, dias })
  }

  // Ranking: el que más falta (menos días sin faltar) va primero; los empates comparten puesto
  const ranking = personas
    ? [...personas]
        .sort((a, b) => a.dias - b.dias || a.nombre.localeCompare(b.nombre))
        .map((p) => ({ ...p, puesto: 1 + personas.filter((o) => o.dias < p.dias).length }))
    : []

  return (
    <section aria-label="Días sin faltar" className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">
          Días sin faltar · Sistemas
        </h2>
        <span className="text-[10px] font-mono text-zinc-500">
          ranking: primero el que más falta
          {error && <span className="ml-2 text-amber-400">· sin conexión con el contador</span>}
        </span>
      </div>

      {!personas && !error && <p className="text-xs text-zinc-500 py-3">Cargando…</p>}

      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ranking.map((p) => {
          const peor = p.puesto === 1
          return (
            <li
              key={p.id}
              className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl border ${
                peor ? 'bg-red-500/[0.07] border-red-500/25' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <span
                className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${
                  peor ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-zinc-400'
                }`}
                title={`Puesto ${p.puesto}`}
              >
                {p.puesto}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[13px] font-semibold text-zinc-100 truncate">{p.nombre}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <button
                    onClick={() => marcarFalta(p)}
                    disabled={guardando}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                    title={`Marcar que ${p.nombre} faltó hoy (vuelve a 0)`}
                  >
                    <UserX size={10} /> Faltó
                  </button>
                  <button
                    onClick={() => corregir(p)}
                    disabled={guardando}
                    className="p-1 rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-white/10 transition-all disabled:opacity-50"
                    title="Corregir el número"
                    aria-label={`Corregir los días de ${p.nombre}`}
                  >
                    <Pencil size={10} />
                  </button>
                </div>
              </div>
              <span
                className={`text-3xl font-extrabold leading-none tabular-nums ${p.dias === 0 ? 'text-red-400' : 'text-[#c6f135]'}`}
                title={`${p.dias} ${p.dias === 1 ? 'día' : 'días'} sin faltar`}
              >
                {p.dias}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
