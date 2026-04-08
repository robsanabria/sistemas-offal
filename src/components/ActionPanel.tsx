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


  const filtered = actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || (a.desc || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <section aria-label="Acciones rápidas" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold">Botonera</h4>
          <p className="text-[12px] text-zinc-500">Accesos principales</p>
        </div>
      </div>

      {/* Accesos principales eliminados por solicitud del usuario */}
      <div className="py-6">
        <p className="text-sm text-zinc-500">La lista de accesos directos se ha ocultado para dar prioridad a la botonera central.</p>
      </div>
    </section>
  )
}
