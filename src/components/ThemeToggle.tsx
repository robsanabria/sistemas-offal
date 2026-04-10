'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
      const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      setTheme(initial as 'dark' | 'light')
      document.documentElement.setAttribute('data-theme', initial as string)
    } catch (err) {
      // ignore
    }
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
    } catch (err) {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="fixed top-4 right-4 z-50 p-2 rounded bg-zinc-900/60 border border-zinc-800 text-sm hover:bg-zinc-800 transition"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
