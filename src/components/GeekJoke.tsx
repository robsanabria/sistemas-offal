'use client'

import { useState, useEffect } from 'react'
import { Terminal, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GeekJoke() {
    const [joke, setJoke] = useState<string>('')
    const [loading, setLoading] = useState(true)

    const fetchJoke = async () => {
        setLoading(true)
        try {
            const res = await fetch('https://geek-jokes.sameerkumar.website/api?format=json')
            const data = await res.json()
            setJoke(data.joke)
        } catch (error) {
            setJoke('Error loading joke. Maybe the server is using Windows ME.')
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchJoke()
    }, [])

    return (
        <div className="cyber-card flex flex-col gap-4 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-green-400">
                    <Terminal size={18} />
                    <span className="font-mono text-xs uppercase tracking-tighter">geek_jokes_v1.0.sh</span>
                </div>
                <button
                    onClick={fetchJoke}
                    disabled={loading}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="terminal-text opacity-50 italic"
                        >
                            $ fetching_humor...
                        </motion.div>
                    ) : (
                        <motion.p
                            key={joke}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="terminal-text text-lg text-center"
                        >
                            "{joke}"
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
