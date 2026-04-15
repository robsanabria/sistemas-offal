'use client'

import { useState } from 'react'
import { Terminal as TerminalIcon, LayoutGrid, Music, Users, Gamepad2 } from 'lucide-react'
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

type TabType = 'dashboard' | 'mpc' | 'collab' | 'games'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <main className="min-h-screen bg-grid py-8 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8 flex flex-col h-[calc(100vh-4rem)]">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              SISTEMICOS <span className="gradient-text">OFFAL</span> <span className="text-zinc-600 font-mono text-sm align-top">V2</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-tighter mt-1">
              PLATAFORMA COLABORATIVA
            </p>
          </div>

          {/* TAB NAVIGATION */}
          <nav className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
              { id: 'mpc', label: 'Botonera MPC', icon: Music },
              { id: 'collab', label: 'Colaborativo', icon: Users },
              { id: 'games', label: 'Juegos', icon: Gamepad2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-grow z-10 relative custom-scrollbar overflow-y-auto pb-10">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="w-full">
                <ActionPanel />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AndreaCounter />
                <RobertoCounter />
                <SpeedCounter />
                <div className="cyber-card p-4 flex items-center justify-center h-full">
                  <SimpsonsQuote />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <MotivationCard />
                <TextToSpeech />
              </div>
            </div>
          )}

          {/* TAB: BOTONERA MPC */}
          {activeTab === 'mpc' && (
            <div className="h-full min-h-[600px] animate-in slide-in-from-bottom-4 fade-in duration-300">
              <PrankButton />
            </div>
          )}

          {/* TAB: COLABORATIVO */}
          {activeTab === 'collab' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <PointsBoard />
                  <div id="coffee-board"><CoffeeBoard /></div>
                </div>
                <div id="whiteboard" className="lg:col-span-2">
                  <Whiteboard />
                </div>
              </div>
              <section>
                <MoodBoard />
              </section>
            </div>
          )}

          {/* TAB: JUEGOS */}
          {activeTab === 'games' && (
            <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="w-full flex justify-center">
                <Buscaminas />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="pt-4 border-t border-zinc-900/80 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 bg-transparent">
          <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] uppercase">
            <TerminalIcon size={14} />
            <span>Protocolo Sistemicos v2.0.0-stable</span>
          </div>

          <div className="flex gap-4 text-zinc-600 text-[10px] font-mono">
            <span>UPTIME: 99.9%</span>
            <span>STATUS DE LA WEB: SE ELEVA MAJESTUOSAMENTE</span>
            <span>AUTH: RES</span>
          </div>
        </footer>

      </div>
    </main>
  )
}