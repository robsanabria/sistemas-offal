'use client'

import { Inter } from 'next/font/google'
import PrankButton from '@/components/PrankButton'
import Gallery from '@/components/Gallery'
import Countdown from '@/components/Countdown'
import FeriadosRestantes from '@/components/FeriadosRestantes'
import { ARCADE_PADS_CSS } from '@/components/arcadePads'

const inter = Inter({ subsets: ['latin'] })

// Paleta "violeta lima"
const BG = '#110a1f'
const ACCENT = '#c6f135'
const GLOW = 'rgba(139,92,246,0.14)'

// Visita del Papa León XIV: llega el domingo 8/11/2026 a las 16:30 (Aeroparque)
const VISITA_PAPA = new Date(2026, 10, 8, 16, 30, 0).getTime()
// Lanzamiento de GTA VI: 19/11/2026, medianoche hora local
const GTA_VI_RELEASE = new Date(2026, 10, 19, 0, 0, 0).getTime()
// Cumpleaños de Tobias: 4 días antes, 15/11/2026
const CUMPLE_TOBIAS = new Date(2026, 10, 15, 0, 0, 0).getTime()

// Tailwind v4 expone los colores como variables: pisar la escala cyan retiñe
// los controles de la botonera sin tocar el componente.
const THEME = {
  background: `radial-gradient(1200px 600px at 50% -10%, ${GLOW}, transparent 70%), ${BG}`,
  '--color-cyan-200': `color-mix(in srgb, ${ACCENT} 60%, white)`,
  '--color-cyan-300': `color-mix(in srgb, ${ACCENT} 80%, white)`,
  '--color-cyan-400': ACCENT,
  '--color-cyan-500': `color-mix(in srgb, ${ACCENT} 85%, black)`,
  '--color-cyan-950': `color-mix(in srgb, ${ACCENT} 20%, black)`,
} as React.CSSProperties

export default function Home() {
  return (
    <div className={`${inter.className} arcade-pads min-h-screen text-zinc-100`} style={THEME}>
      <style>{ARCADE_PADS_CSS}</style>

      {/* Marca + feriados arriba; cuentas regresivas centradas debajo, en orden cronológico */}
      <header className="max-w-[1600px] mx-auto px-4 md:px-8 pt-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/cow.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            <h1 className="text-[15px] font-bold tracking-tight">
              Sistémicos <span style={{ color: ACCENT }}>Offal</span>
            </h1>
          </div>
          <FeriadosRestantes />
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Countdown label="Visita del Papa" target={VISITA_PAPA} doneText="¡Ya llegó!" accent="#fbbf24" />
          <Countdown label="Cumple Tobias" target={CUMPLE_TOBIAS} doneText="¡Feliz cumple!" accent="#f472b6" />
          <Countdown label="GTA VI" target={GTA_VI_RELEASE} accent={ACCENT} />
        </div>
      </header>

      {/* Página única: botonera + tira de fotos (lateral en desktop, debajo en mobile) */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
        <PrankButton />
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto custom-scrollbar lg:pr-1">
          <Gallery layout="strip" />
        </aside>
      </main>

      <footer className="py-4 border-t border-white/5 text-center text-zinc-600 text-xs">
        Sistémicos Offal · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
