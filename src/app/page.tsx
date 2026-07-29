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

type TabType = 'mpc' | 'office'

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('mpc')

  return (
    <main className="min-h-screen bg-grid py-5 px-4 md:px-8 font-sans">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* TOP BAR (Clean SaaS) */}
        <header className="sticky top-0 z-50 py-3 backdrop-blur-md bg-[#0d1524]/85 border-b border-white/10 flex items-center justify-between gap-4">
          {/* Marca */}
          <div className="flex items-center gap-2.5">
            <img src="/cow.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight">
                Sistémicos <span className="text-cyan-400">Offal</span>
              </div>
              <div className="text-zinc-500 text-[10px] hidden sm:block">Herramientas de oficina</div>
            </div>
          </div>

          {/* Navegación segmentada */}
          <nav className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {[
              { id: 'mpc', label: 'Botonera', icon: Music },
              { id: 'office', label: 'Oficina', icon: LayoutGrid },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-cyan-400' : ''} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Estado + avatar */}
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> online
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[11px] font-bold text-zinc-300">
              RS
            </div>
          </div>
        </header>

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
        <footer className="py-6 mt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-zinc-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sistémicos Offal · {new Date().getFullYear()}</span>
          </div>
          <span className="text-zinc-600">@ROBSANABRIA</span>
        </footer>

      </div>
    </main>
  )
}
