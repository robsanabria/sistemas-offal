'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfesionPage() {
  const [step, setStep] = useState<'inicio' | 'resultado'>('inicio')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  const handleSi = () => {
    setMensaje('Has elegido "Sí". Gracias por confesar. 🚔')
    setStep('resultado')
  }

  const handleNo = () => {
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

        {/* “Gorgori” */}
        <div className="mb-4">
          <img
            src="https://i.imgur.com/7yUvePI.png"
            alt="Jefe Gorgori"
            className="mx-auto w-40"
          />
          <p className="text-sm mt-2">Jefe Gorgori dice:</p>
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

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => router.back()}
        className="mt-6 bg-black text-white px-4 py-2 border-2 border-white"
      >
        ⬅ Volver atrás
      </button>

    </div>
  )
}