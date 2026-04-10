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
    <section aria-label="Acciones rápidas" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold">Botonera</h4>
        </div>
      </div>

      {/* Render pequeño buscador y tarjetas de acciones (mejora UX) */}
      <div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar acción..."
          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-sm"
          aria-label="Buscar acciones"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          {filtered.map((a) => (
            <a
              key={a.id}
              href={a.href}
              target={a.external ? '_blank' : '_self'}
              rel={a.external ? 'noreferrer' : undefined}
              className="p-2 bg-zinc-800 rounded flex items-center gap-2 hover:bg-zinc-700 transition"
            >
              <span className="text-lg">{a.emoji}</span>
              <div>
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-[11px] text-zinc-500">{a.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
