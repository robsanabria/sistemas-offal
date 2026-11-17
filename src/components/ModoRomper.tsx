"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Bomb } from 'lucide-react'
import { iniciarJuego, ROMPER_CSS } from './romper/juego'

// Botón "Romper": activa un overlay con el muñequito que le dispara a la página.
// Cuando no queda nada entero en pantalla (o al salir con Esc) se restaura todo.
export default function ModoRomper() {
  const [activo, setActivo] = useState(false)
  const [rotos, setRotos] = useState(0)
  const [fin, setFin] = useState(false)
  const capaRef = useRef<HTMLDivElement>(null)
  const mundoRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const salir = useCallback(() => setActivo(false), [])

  useEffect(() => {
    if (!activo || !capaRef.current || !mundoRef.current) return
    let cierre: ReturnType<typeof setTimeout> | undefined
    const detener = iniciarJuego({
      capa: capaRef.current,
      mundo: mundoRef.current,
      mouse: mouseRef.current,
      onRoto: setRotos,
      onFin: () => {
        setFin(true)
        cierre = setTimeout(salir, 1800)
      },
      onSalir: salir,
    })
    return () => {
      clearTimeout(cierre)
      detener()
    }
  }, [activo, salir])

  const activar = (e: React.MouseEvent) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
    setRotos(0)
    setFin(false)
    setActivo(true)
  }

  return (
    <>
      <button
        onClick={activar}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
        title="Modo romper: un muñequito que le dispara a la página. Al terminar vuelve todo a la normalidad."
      >
        <Bomb size={14} /> Romper
      </button>

      {activo && createPortal(
        <div ref={capaRef} className="fixed inset-0 z-[300] cursor-crosshair select-none touch-manipulation">
          <style>{ROMPER_CSS}</style>
          <div ref={mundoRef} className="rp-mundo" />

          <div
            data-rp-hud
            className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/85 border border-white/15 text-xs text-zinc-200 whitespace-nowrap cursor-default"
          >
            <span className="font-black uppercase tracking-widest text-red-400">Modo romper</span>
            <span className="hidden md:inline text-zinc-400">WASD o flechas para moverte · clic para disparar</span>
            <span className="font-bold tabular-nums">{rotos} {rotos === 1 ? 'roto' : 'rotos'}</span>
            <button
              onClick={salir}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-100 font-semibold transition-colors"
            >
              Salir (Esc)
            </button>
          </div>

          {fin && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="px-6 py-3 rounded-2xl bg-black/80 border border-white/15 text-3xl md:text-5xl font-black text-[#c6f135]">
                ¡Rompiste todo!
              </span>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
