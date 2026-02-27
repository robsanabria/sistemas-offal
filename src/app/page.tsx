import AndreaCounter from '@/components/AndreaCounter'
import SpeedCounter from '@/components/SpeedCounter'
import CoffeeBoard from '@/components/CoffeeBoard'
import TrucoGame from '@/components/TrucoGame'
import SimpsonsQuote from '@/components/SimpsonsQuote'
import MotivationCard from '@/components/MotivationCard'
import MoodBoard from '@/components/MoodBoard'
import PrankButton from '@/components/PrankButton'
import Whiteboard from '@/components/Whiteboard'
import PointsBoard from '@/components/PointsBoard'
import Buscaminas from '@/components/Buscaminas'
import { Monitor, Beef, Terminal as TerminalIcon, ExternalLink, UtensilsCrossed } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-grid py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Section */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Beef size={14} />
            <span>OFICINA DE SISTEMAS - OFFAL - COBURZA, ARG</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            SISTEMICOS <span className="gradient-text">OFFAL</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm max-w-2xl mx-auto uppercase tracking-tighter">
            WEB COLABORATIVAAAAAA
          </p>
        </header>

        {/* Mid Row: Motivation, Prank & Buffet Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <MotivationCard />
          </div>
          <div className="lg:col-span-1">
            <PrankButton />
          </div>
          <div className="lg:col-span-1">
            <div className="cyber-card h-full flex flex-col items-center justify-center gap-3 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group active:scale-95">
              <UtensilsCrossed size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <span className="text-[10px] font-mono text-emerald-500/50 uppercase block">Buffet Box</span>
                <span className="text-sm font-black text-white italic uppercase tracking-tighter flex items-center gap-1">
                  Menú del Mes <ExternalLink size={12} />
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full px-4">
                <a
                  href="https://wa.me/5491166968656?text=Hola%2C%20quiero%20hacer%20un%20pedido%20de%20Pizzas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-sm"
                >
                  📱 Lo de Negaro (Pizzas)
                </a>

                <a
                  href="https://wa.me/?text=Hola%20(abrir%20WhatsApp%20para%20elegir%20contacto)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/80 hover:bg-emerald-600 text-white font-semibold rounded-md text-sm"
                >
                  📱 Otro WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard - 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AndreaCounter />
          <SpeedCounter />
          <CoffeeBoard />
        </div>

        {/* Whiteboard and Points Board Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PointsBoard />
          </div>
          <div className="lg:col-span-2">
            <Whiteboard />
          </div>
        </div>

        {/* Mood Board - Full width */}
        <section>
          <MoodBoard />
        </section>

        {/* Footer Fun Section - Truco & Simpsons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TrucoGame />
          </div>
          <div className="lg:col-span-2">
            <SimpsonsQuote />
          </div>
        </div>

        {/* Buscaminas Section - Home only */}
        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-1">
            <Buscaminas />
          </div>
        </div>

        {/* System Footer */}
        <footer className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] uppercase">
            <TerminalIcon size={14} />
            <span>Protocolo Sistemicos v1.0.0-stable</span>
          </div>
          <div className="flex gap-4 text-zinc-600 text-[10px] font-mono">
            <span>UPTIME: 99.9%</span>
            <span>STATUS DE LA WEB: SE ELEVA MAJESTUAOSAMENTE</span>
            <span>AUTH: RES</span>
          </div>
        </footer>

      </div>
    </main>
  )
}
