'use client'

import { useState, useEffect } from 'react'
import { Music, Images } from 'lucide-react'
import PrankButton from '@/components/PrankButton'
import Gallery from '@/components/Gallery'

type TabType = 'mpc' | 'gallery'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('mpc')

  // la pestaña vive en la URL (?tab=galeria) para poder recargar y compartir
  useEffect(() => {
    const sync = () =>
      setActiveTab(new URLSearchParams(window.location.search).get('tab') === 'galeria' ? 'gallery' : 'mpc')
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const selectTab = (tab: TabType) => {
    setActiveTab(tab)
    window.history.pushState(null, '', tab === 'gallery' ? '?tab=galeria' : window.location.pathname)
  }

  return (
    <main className="min-h-screen bg-grid py-5 px-4 md:px-8 font-sans">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* TOP BAR (Clean SaaS) */}
        <header className="sticky top-0 z-50 py-3 backdrop-blur-md bg-[#0d1524]/85 border-b border-white/10 flex items-center justify-between gap-4">
          {/* Marca */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/cow.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            <div className="leading-tight hidden sm:block">
              <div className="text-[15px] font-bold tracking-tight">
                Sistémicos <span className="text-cyan-400">Offal</span>
              </div>
              <div className="text-zinc-500 text-[10px]">Botonera y galería</div>
            </div>
          </div>

          {/* Navegación segmentada */}
          <nav className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {[
              { id: 'mpc', label: 'Botonera', icon: Music },
              { id: 'gallery', label: 'Galería', icon: Images },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id as TabType)}
                aria-pressed={activeTab === tab.id}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

          {/* Contrapeso de la marca para mantener la navegación centrada */}
          <div className="hidden sm:block w-[150px] shrink-0" aria-hidden />
        </header>

        {/* CONTENT */}
        <div className="relative min-h-[60vh] pb-8">

          {/* TAB: BOTONERA */}
          {activeTab === 'mpc' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PrankButton />
            </div>
          )}

          {/* TAB: GALERÍA */}
          {activeTab === 'gallery' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Gallery />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="py-4 border-t border-white/5 text-center text-zinc-600 text-xs">
          Sistémicos Offal · {new Date().getFullYear()}
        </footer>

      </div>
    </main>
  )
}
