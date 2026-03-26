'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ConfesionPage() {
  const [step, setStep] = useState<'inicio' | 'resultado'>('inicio')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  const playSirena = () => {
    const audio = new Audio('/sirena.mp3') // 👉 después te explico esto
    audio.play()
  }

  const handleSi = () => {
    setMensaje('Has elegido "Sí". Gracias por confesar. 🚔')
    setStep('resultado')
  }

  const handleNo = () => {
    playSirena()
    setMensaje('Has elegido "No"... lo que significa que cometiste un crimen pero no quieres confesar 😡🚨')
    setStep('resultado')
  }

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center text-black font-mono p-6">

      {/* CABECERA */}
      <div className="bg-blue-700 text-white w-full max-w-2xl text-center p-4 border-4 border-black shadow-lg">
        <h1 className="text-2xl font-bold uppercase">
          🚔 Departamento de Policía de Springfield 🚔
        </h1>
      </div>

      {/* CONTENIDO */}
      <div className="bg-white w-full max-w-2xl border-4 border-black p-6 text-center shadow-lg">

        {/* 🐷 GORGORI SVG ANIMADO */}
        <div className="mb-4 flex flex-col items-center">

          <svg width="160" height="160" viewBox="0 0 200 200">

            {/* Cara */}
            <circle cx="100" cy="100" r="80" fill="#FFD90F" stroke="black" strokeWidth="3"/>

            {/* OJO IZQ */}
            <g>
              <circle cx="75" cy="80" r="18" fill="white" stroke="black" strokeWidth="2"/>
              
              <motion.ellipse
                cx="75"
                cy="80"
                rx="18"
                ry="18"
                fill="white"
                animate={{ ry: [18, 2, 18] }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />

              <circle cx="75" cy="85" r="6" fill="black"/>
            </g>

            {/* OJO DER */}
            <g>
              <circle cx="125" cy="80" r="18" fill="white" stroke="black" strokeWidth="2"/>
              
              <motion.ellipse
                cx="125"
                cy="80"
                rx="18"
                ry="18"
                fill="white"
                animate={{ ry: [18, 2, 18] }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />

              <circle cx="125" cy="85" r="6" fill="black"/>
            </g>

            {/* Nariz */}
            <ellipse cx="100" cy="110" rx="25" ry="18" fill="#F4A6A6" stroke="black" strokeWidth="2"/>
            <circle cx="92" cy="110" r="3" fill="black"/>
            <circle cx="108" cy="110" r="3" fill="black"/>

            {/* Boca */}
            <path d="M70 135 Q100 160 130 135" stroke="black" strokeWidth="3" fill="none"/>

            {/* Sombrero */}
            <rect x="40" y="30" width="120" height="30" fill="#3B82F6" stroke="black" strokeWidth="2"/>
            <rect x="60" y="10" width="80" height="30" fill="#2563EB" stroke="black" strokeWidth="2"/>
            <circle cx="100" cy="40" r="6" fill="gold" stroke="black"/>

          </svg>

          <p className="text-sm mt-2">Jefe Gorgori te está mirando...</p>
        </div>

        {step === 'inicio' && (
          <>
            <p className="text-lg font-bold mb-6">
              Si cometiste un crimen y quieres confesar,
              haz clic en "Sí".<br /><br />
              De lo contrario, haz clic en "No".
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={handleSi}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-xl border-2 border-black"
              >
                ✅ SÍ
              </button>

              <button
                onClick={handleNo}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-xl border-2 border-black"
              >
                ❌ NO
              </button>
            </div>
          </>
        )}

        {step === 'resultado' && (
          <>
            <p className="text-xl font-bold mb-6">
              {mensaje}
            </p>

            <button
              onClick={() => setStep('inicio')}
              className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 border-2 border-black"
            >
              🔄 Intentar de nuevo
            </button>
          </>
        )}

      </div>

      {/* VOLVER */}
      <button
        onClick={() => router.back()}
        className="mt-6 bg-black text-white px-4 py-2 border-2 border-white"
      >
        ⬅ Volver atrás
      </button>

    </div>
  )
}