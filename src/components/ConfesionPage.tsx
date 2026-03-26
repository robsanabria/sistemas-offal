'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ConfesionPage() {
  const [respuesta, setRespuesta] = useState<string | null>(null)
  const router = useRouter()

  // 🔊 audio automático (opcional)
  useEffect(() => {
    const audio = new Audio('/sirena.mp3') // poné el mp3 en /public
    audio.volume = 0.3
    audio.play().catch(() => {})
  }, [])

  const handleSubmit = () => {
    if (!respuesta) return

    if (respuesta === 'si') {
      alert('Has elegido "Sí". Gracias por confesar. 🚔')
    } else {
      alert('Has elegido "No"... lo que significa que cometiste un crimen pero no quieres confesar 😡🚨')
    }
  }

  return (
    <div className="min-h-screen bg-[#c0c0c0] flex items-center justify-center font-sans">

      {/* VENTANA TIPO WINDOWS */}
      <div className="w-[420px] border-2 border-black bg-[#d4d0c8] shadow-[4px_4px_0px_black]">

        {/* HEADER */}
        <div className="bg-[#000080] text-white px-2 py-1 text-sm font-bold">
          Springfield Police Department
        </div>

        {/* CONTENIDO */}
        <div className="p-6 flex flex-col items-center gap-4 text-center">

          {/* SVG GORGORI */}
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 200 200">
              {/* cara */}
              <rect x="40" y="60" width="120" height="100" fill="#FFD90F" stroke="black"/>

              {/* gorra */}
              <rect x="30" y="30" width="140" height="40" fill="#3b6ea5" stroke="black"/>
              
              {/* ojos */}
              <motion.circle
                cx="80"
                cy="100"
                r="12"
                fill="white"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <motion.circle
                cx="120"
                cy="100"
                r="12"
                fill="white"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
              />

              {/* pupilas */}
              <circle cx="80" cy="100" r="5" fill="black"/>
              <circle cx="120" cy="100" r="5" fill="black"/>

              {/* boca */}
              <line x1="80" y1="130" x2="120" y2="130" stroke="black" strokeWidth="3"/>
            </svg>
          </div>

          {/* TEXTO */}
          <p className="text-sm">
            If you committed a crime and want to confess, click "Yes".
            <br />
            Otherwise, click "No".
          </p>

          {/* RADIOS (CLAVE para parecerse al original) */}
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="respuesta"
                value="si"
                onChange={(e) => setRespuesta(e.target.value)}
              />
              Yes
            </label>

            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="respuesta"
                value="no"
                onChange={(e) => setRespuesta(e.target.value)}
              />
              No
            </label>
          </div>

          {/* BOTÓN */}
          <button
            onClick={handleSubmit}
            className="mt-3 px-4 py-1 border border-black bg-[#e0e0e0] active:translate-x-[2px] active:translate-y-[2px]"
          >
            OK
          </button>

        </div>
      </div>

      {/* VOLVER */}
      <button
        onClick={() => router.back()}
        className="absolute bottom-6 left-6 text-xs underline"
      >
        ← Back
      </button>

    </div>
  )
}