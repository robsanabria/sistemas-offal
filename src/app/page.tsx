'use client'

import { Inter } from 'next/font/google'
import PrankButton from '@/components/PrankButton'
import Gallery from '@/components/Gallery'
import Countdown from '@/components/Countdown'
import { ARCADE_PADS_CSS } from '@/components/arcadePads'

const inter = Inter({ subsets: ['latin'] })

// Paleta "violeta lima"
const BG = '#110a1f'
const ACCENT = '#c6f135'
const GLOW = 'rgba(139,92,246,0.14)'

// Lanzamiento de GTA VI: 19/11/2026, medianoche hora local
const GTA_VI_RELEASE = new Date(2026, 10, 19, 0, 0, 0).getTime()

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

      {/* Marca a la izquierda y cuenta regresiva centrada (apiladas en mobile) */}
      <header className="max-w-[1600px] mx-auto px-4 md:px-8 pt-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/cow.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-[15px] font-bold tracking-tight">
            Sistémicos <span style={{ color: ACCENT }}>Offal</span>
          </h1>
        </div>
        <div className="justify-self-center">
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
