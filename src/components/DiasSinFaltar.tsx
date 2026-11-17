"use client"

import { useEffect, useState, useCallback } from 'react'
import { Pencil, UserX } from 'lucide-react'

interface Persona {
  id: string
  nombre: string
  dias: number
}

// Contadores compartidos de "días sin faltar" + ranking de quién falta más.
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

  // el que más falta = el que menos días lleva sin faltar
  const ranking = personas ? [...personas].sort((a, b) => a.dias - b.dias || a.nombre.localeCompare(b.nombre)) : []

  return (
    <section aria-label="Días sin faltar" className="flex flex-wrap items-stretch justify-center gap-4">
      {(personas ?? [{ id: 'a', nombre: '…', dias: -1 }, { id: 'b', nombre: '…', dias: -1 }]).map((p) => (
        <div
          key={p.id}
          className="group relative flex flex-col items-center justify-center min-w-[200px] px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Días sin faltar</span>
          <span className="text-sm font-bold text-zinc-100">{p.nombre}</span>
          <span
            className={`mt-1 text-5xl font-extrabold leading-none tabular-nums ${
              p.dias === 0 ? 'text-red-400' : 'text-[#c6f135]'
            }`}
          >
            {p.dias < 0 ? '–' : p.dias}
          </span>
          {personas && (
            <div className="mt-2 flex items-center gap-1.5">
              <button
                onClick={() => marcarFalta(p)}
                disabled={guardando}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                title={`Marcar que ${p.nombre} faltó hoy (vuelve a 0)`}
              >
                <UserX size={12} /> Faltó
              </button>
              <button
                onClick={() => corregir(p)}
                disabled={guardando}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-white/10 transition-all disabled:opacity-50"
                title="Corregir el número"
                aria-label={`Corregir los días de ${p.nombre}`}
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-col min-w-[220px] px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">Ranking · quién falta más</span>
        <ol className="mt-2 space-y-1.5">
          {ranking.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2.5 text-sm">
              <span
                className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black ${
                  i === 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-zinc-400'
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-semibold ${i === 0 ? 'text-zinc-100' : 'text-zinc-300'}`}>{p.nombre}</span>
              <span className="ml-auto tabular-nums text-zinc-400">
                {p.dias} {p.dias === 1 ? 'día' : 'días'}
              </span>
            </li>
          ))}
          {!personas && !error && <li className="text-xs text-zinc-500">Cargando…</li>}
        </ol>
        {error && <span className="mt-2 text-[10px] text-amber-400">No se pudo conectar con el contador</span>}
      </div>
    </section>
  )
}
