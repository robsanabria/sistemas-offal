'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, RefreshCw, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Meme {
    url: string
    title: string
}

export default function MemeFeed() {
    const [meme, setMeme] = useState<Meme | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchMeme = async () => {
        setLoading(true)
        try {
            // Using a friendly meme API
            const res = await fetch('https://meme-api.com/gimme/wholesomememes')
            const data = await res.json()
            setMeme({
                url: data.url,
                title: data.title
            })
        } catch (error) {
            console.error('Failed to fetch meme')
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchMeme()
    }, [])

    return (
        <div className="cyber-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                    <ImageIcon size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Meme del Momento</h3>
                </div>
                <button
                    onClick={fetchMeme}
                    disabled={loading}
                    className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-zinc-800 font-black text-2xl uppercase tracking-tighter"
                        >
                            LOADING_PIXELS...
                        </motion.div>
                    ) : meme ? (
                        <motion.div
                            key={meme.url}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full group"
                        >
                            <img
                                src={meme.url}
                                alt={meme.title}
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-xs text-white font-mono truncate flex-1">{meme.title}</p>
                                <a
                                    href={meme.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-white ml-2"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-zinc-500 text-xs">No memes found in the cache.</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
