'use client'

import { useRouter } from 'next/navigation'

export default function ConfesionPage() {
  const router = useRouter()

  const responder = () => {
    alert('Has elegido "No", lo que significa que cometiste un crimen pero no quieres confesar.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 bg-black text-white px-4">

      <h1 className="text-3xl font-black">
        🚨 SISTEMA DE DENUNCIAS 🚨
      </h1>

      <p className="max-w-md text-zinc-400">
        Si cometiste un crimen y quieres confesar, haz clic en "Sí".
        <br />
        De lo contrario, haz clic en "No".
      </p>

      <div className="flex gap-4 mt-4">

        <button
          onClick={responder}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-bold"
        >
          Sí
        </button>

        <button
          onClick={responder}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded font-bold"
        >
          No
        </button>

      </div>

      {/* VOLVER */}
      <button
        onClick={() => router.back()}
        className="mt-6 text-sm text-zinc-500 hover:text-white underline"
      >
        ← Volver
      </button>

    </div>
  )
}