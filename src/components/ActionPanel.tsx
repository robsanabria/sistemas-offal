"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'

type Action = {
  id: string
  title: string
  desc?: string
  href: string
  external?: boolean
  emoji?: string
}

const DEFAULT_ACTIONS: Action[] = [
  { id: 'menu', title: 'Ver Menú', desc: 'Buffet Box', href: 'https://cdn-1.humand.co/files/file-9723--3ceb4dbe-1b7d-415e-a9d9-13dcc47643ff.pdf?token=0pI75ViDW8HpN6O_1iM6VD-9BJHUTe1OvaQLK_pOu5M&expires=1775427083', external: true, emoji: '🍽️' },
  { id: 'pizza', title: 'Pedir Pizza', desc: 'WhatsApp', href: 'https://wa.me/5491166968656?text=Hola%2C%20quiero%20hacer%20un%20pedido%20de%20Pizzas', external: true, emoji: '🍕' },
  { id: 'homers', title: 'Homers Web', desc: 'Zona peligrosa', href: 'https://skavenger.byethost8.com/homerswebpage/', external: true, emoji: '🍩' },
  { id: 'whiteboard', title: 'Whiteboard', desc: 'Pizarra colaborativa', href: '/app/whiteboard', emoji: '✏️' },
  { id: 'coffee', title: 'Coffee Board', desc: 'Estado del café', href: '/app/board/coffee/route', emoji: '☕' },
]

export default function ActionPanel() {
  const [query, setQuery] = useState('')
  const [actions] = useState<Action[]>(DEFAULT_ACTIONS)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])


  const filtered = actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || (a.desc || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <section aria-label="Acciones rápidas" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar herramienta o acción (Ctrl+K)"
            className="w-full pl-10 pr-3 py-2 bg-zinc-900/40 border border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Buscar acciones"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="cyber-card p-3 flex items-center gap-3 hover:shadow-lg transition-shadow">
            <div className="text-2xl">{a.emoji}</div>
            <div className="flex-1">
              <a href={a.href} target={a.external ? '_blank' : undefined} rel={a.external ? 'noopener noreferrer' : undefined} className="block text-sm font-semibold text-white">
                {a.title} {a.external && <ExternalLink size={12} className="inline-block ml-1 text-zinc-400" />}
              </a>
              {a.desc && <div className="text-[12px] text-zinc-500">{a.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
