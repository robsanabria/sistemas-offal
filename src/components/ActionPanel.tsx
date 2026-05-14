"use client"

import React, { useEffect, useRef, useState } from 'react'

type Action = {
  id: string
  title: string
  desc?: string
  href: string
  external?: boolean
  emoji?: string
}

const DEFAULT_ACTIONS: Action[] = [
  { id: 'menu', title: 'Ver Menú', desc: 'Menu Liserar de Abril', href: '/menuabril.pdf', external: true, emoji: '🍽️' },
  { id: 'update-windows', title: 'Actualizar Windows', desc: '', href: 'https://fakeupdate.net/win10ue/', external: true, emoji: '🪟' },
  { id: 'useless', title: 'Cosas inútiles', desc: 'Hora de perder tiempo', href: 'https://theuselessweb.com/', external: true, emoji: '🫠' },
  { id: 'pizza', title: 'Pedir Pizza', desc: 'WhatsApp', href: 'https://wa.me/5491166968656?text=Hola%2C%20quiero%20hacer%20un%20pedido%20de%20Pizzas', external: true, emoji: '🍕' },
  { id: 'homers', title: 'Homers Web', desc: 'Zona peligrosa', href: 'https://skavenger.byethost8.com/homerswebpage/', external: true, emoji: '🍩' },
  { id: 'whiteboard', title: 'Whiteboard', desc: 'Pizarra colaborativa (sección)', href: '#whiteboard', emoji: '✏️' },
  { id: 'coffee', title: 'Coffee Board', desc: 'Estado del café (sección)', href: '#coffee-board', emoji: '☕' },
]

export default function ActionPanel() {
  const [query, setQuery] = useState('')
  const [actions] = useState<Action[]>(DEFAULT_ACTIONS)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const filtered = actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || (a.desc || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <section aria-label="Acciones rápidas" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold tracking-tight">Acceso Rápido</h4>
          <p className="text-zinc-500 text-xs font-mono uppercase">Protocolos de ejecución inmediata</p>
        </div>
        <div className="relative w-full md:w-72 group">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar acciones..."
            className="w-full pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-600"
            aria-label="Buscar acciones"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors">
            🔍
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {filtered.map((a) => (
          <a
            key={a.id}
            href={a.href}
            target={a.external ? '_blank' : '_self'}
            rel={a.external ? 'noreferrer' : undefined}
            className="group cyber-card !p-4 flex flex-col items-center text-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-3xl group-hover:animate-bounce transition-transform">{a.emoji}</span>
            <div>
              <div className="text-sm font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors">{a.title}</div>
              {a.desc && <div className="text-[10px] text-zinc-500 font-medium leading-tight mt-1 line-clamp-1">{a.desc}</div>}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
