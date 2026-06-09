'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music, LayoutGrid, Gauge, Users, Wrench, Gamepad2, Palette } from 'lucide-react'
import AndreaCounter from '@/components/AndreaCounter'
import RobertoCounter from '@/components/RobertoCounter'
import SpeedCounter from '@/components/SpeedCounter'
import CoffeeBoard from '@/components/CoffeeBoard'
import SimpsonsQuote from '@/components/SimpsonsQuote'
import MotivationCard from '@/components/MotivationCard'
import ActionPanel from '@/components/ActionPanel'
import MoodBoard from '@/components/MoodBoard'
import PrankButton from '@/components/PrankButton'
import Whiteboard from '@/components/Whiteboard'
import PointsBoard from '@/components/PointsBoard'
import TextToSpeech from '@/components/TextToSpeech'
import Buscaminas from '@/components/Buscaminas'
import MorseCoder from '@/components/MorseCoder'
import Countdown from '@/components/Countdown'

type TabType = 'mpc' | 'office'

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-bold tracking-tight text-zinc-100 uppercase">{title}</h2>
        <p className="text-[11px] text-zinc-500 font-mono">{subtitle}</p>
      </div>
      <div className="flex-grow h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('mpc')

  return (
    <main className="min-h-screen bg-grid py-5 px-4 md:px-8 font-sans">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* HEADER (compacto) */}
        <header className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <img src="/cow.png" alt="" className="w-9 h-9 rounded-lg object-cover hidden sm:block" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tightest leading-none">
                SISTEMICOS <span className="gradient-text">OFFAL</span>
              </h1>
              <p className="text-zinc-500 text-[11px] md:text-xs">Botonera y herramientas de oficina</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Core v2.4
          </div>
        </header>

        {/* Countdown Mundial 2026 */}
        <Countdown />

        {/* NAVIGATION (2 secciones) */}
        <nav className="nav-blur sticky top-4 z-50">
          {[
            { id: 'mpc', label: 'Botonera', icon: Music },
            { id: 'office', label: 'Oficina', icon: LayoutGrid },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-inner border border-white/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-cyan-400' : ''} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <div className="relative min-h-[60vh] pb-16">

          {/* TAB: BOTONERA */}
          {activeTab === 'mpc' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PrankButton />
            </div>
          )}

          {/* TAB: OFICINA (todo lo demás, organizado) */}
          {activeTab === 'office' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Acceso rápido */}
              <section>
                <ActionPanel />
              </section>

              {/* Métricas */}
              <section>
                <SectionHeader icon={Gauge} title="Métricas" subtitle="Contadores y estado del día" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AndreaCounter />
                  <RobertoCounter />
                  <SpeedCounter />
                  <div className="cyber-card flex items-center justify-center min-h-[160px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <SimpsonsQuote />
                  </div>
                </div>
              </section>

              {/* Colaborativo */}
              <section>
                <SectionHeader icon={Users} title="Colaborativo" subtitle="Pizarra, café, puntos y mood en tiempo real" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 space-y-6">
                    <PointsBoard />
                    <div id="coffee-board"><CoffeeBoard /></div>
                  </div>
                  <div id="whiteboard" className="lg:col-span-8">
                    <Whiteboard />
                  </div>
                </div>
                <div className="mt-6">
                  <MoodBoard />
                </div>
              </section>

              {/* Herramientas */}
              <section>
                <SectionHeader icon={Wrench} title="Herramientas" subtitle="Motivación, texto a voz y código morse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <MotivationCard />
                  <TextToSpeech />
                </div>
                <div className="mt-6">
                  <MorseCoder />
                </div>
              </section>

              {/* Juegos */}
              <section>
                <SectionHeader icon={Gamepad2} title="Juegos" subtitle="Para cuando no hay peleas (jeje)" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2">
                    <Buscaminas />
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/room', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId: 'public' })
                        })
                      } catch (err) {
                        console.error('Error creating public room', err)
                      }
                      router.push('/pictonary?roomId=public')
                    }}
                    className="cyber-card flex flex-col items-center justify-center gap-3 text-center min-h-[200px] hover:scale-[1.02] transition-transform group"
                  >
                    <Palette size={36} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-lg font-bold">Pictionary</div>
                      <p className="text-xs text-zinc-500 mt-1">Sala colaborativa de dibujo</p>
                    </div>
                    <span className="px-3 py-1.5 mt-1 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold">
                      Abrir sala →
                    </span>
                  </button>
                </div>
              </section>

            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="py-6 mt-auto border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Protocol Stable</span>
            <span className="text-zinc-600">|</span>
            <span>Ref: {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-zinc-500 text-[11px] font-mono">
            <span className="hover:text-cyan-400 transition-colors cursor-default">SISTEMA NOMINAL</span>
            <span className="text-zinc-700">@ROBSANABRIA</span>
          </div>
        </footer>

      </div>
    </main>
  )
}
