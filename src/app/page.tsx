'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal as TerminalIcon, LayoutGrid, Music, Users, Gamepad2, Radio, Palette } from 'lucide-react'
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

type TabType = 'dashboard' | 'mpc' | 'collab' | 'pictonary' | 'games' | 'morse'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <main className="min-h-screen bg-grid py-6 px-4 md:px-8 font-sans transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto space-y-8 flex flex-col">
        
        {/* HEADER */}
        <header className="flex flex-col items-center text-center gap-2 pt-4">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-2 animate-pulse">
            Sistemicos Core v2.4
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tightest leading-none">
            SISTEMICOS <span className="gradient-text">OFFAL</span>
          </h1>
          <p className="text-zinc-400 font-medium text-sm md:text-base max-w-2xl">
            Centro de operaciones colaborativas, métricas en tiempo real y entretenimiento sistémico.
          </p>
          <Countdown />
        </header>

        {/* FLOATING NAVIGATION */}
        <nav className="nav-blur sticky top-6 z-50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
            { id: 'mpc', label: 'MPC Control', icon: Music },
            { id: 'collab', label: 'Colaborativo', icon: Users },
            { id: 'pictonary', label: 'Pictonary', icon: Palette },
            { id: 'morse', label: 'Código Morse', icon: Radio },
            { id: 'games', label: 'Arcade', icon: Gamepad2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-inner border border-white/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-cyan-400' : ''} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* CONTENT AREA */}
        <div className="relative min-h-[60vh] pb-20">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
              <div className="w-full">
                <ActionPanel />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AndreaCounter />
                <RobertoCounter />
                <SpeedCounter />
                <div className="cyber-card flex items-center justify-center min-h-[160px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <SimpsonsQuote />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <MotivationCard />
                <TextToSpeech />
              </div>
            </div>
          )}

          {/* TAB: BOTONERA MPC */}
          {activeTab === 'mpc' && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
              <PrankButton />
            </div>
          )}

          {/* TAB: COLABORATIVO */}
          {activeTab === 'collab' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                  <PointsBoard />
                  <div id="coffee-board"><CoffeeBoard /></div>
                </div>
                <div id="whiteboard" className="lg:col-span-8">
                  <Whiteboard />
                </div>
              </div>
              <section className="pt-4">
                <MoodBoard />
              </section>
            </div>
          )}

          {/* TAB: JUEGOS */}
          {activeTab === 'games' && (
            <div className="flex justify-center items-start animate-in scale-95 fade-in duration-500 pt-4">
              <div className="w-full max-w-4xl">
                <Buscaminas />
              </div>
            </div>
          )}

          {/* TAB: PICTONARY */}
          {activeTab === 'pictonary' && (
            <div className="flex items-center justify-center h-72">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">🎨 Pictonary</h2>
                <p className="text-zinc-300 mb-4">Sala colaborativa de dibujo — abrí la sala en una nueva página.</p>
                <button
                  onClick={async () => {
                    try {
                      // ensure public room exists (backend will create or return existing)
                      const res = await fetch('/api/room', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomId: 'public' })
                      });
                      if (!res.ok) {
                        console.error('Failed to ensure public room', await res.text());
                        // fallback: still navigate to the public URL
                      }
                    } catch (err) {
                      console.error('Error creating public room', err);
                    }
                    router.push('/pictonary?roomId=public');
                  }}
                  className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
                >
                  Ir a Pictonary
                </button>
              </div>
            </div>
          )}

          {/* TAB: CÓDIGO MORSE */}
          {activeTab === 'morse' && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
              <MorseCoder />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="py-8 mt-auto border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Protocol Stable</span>
            <span className="text-zinc-600">|</span>
            <span>Ref: {new Date().getFullYear()}</span>
          </div>

          <div className="flex gap-6 text-zinc-500 text-[11px] font-mono">
            <span className="hover:text-cyan-400 transition-colors cursor-default">SISTEMA NOMINAL</span>
            <span className="hover:text-cyan-400 transition-colors cursor-default">LATENCIA: 12ms</span>
            <span className="text-zinc-700">@ROBSANABRIA</span>
          </div>
        </footer>

      </div>
    </main>
  )
}
