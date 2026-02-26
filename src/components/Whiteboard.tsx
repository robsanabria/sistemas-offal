'use client'

import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Save, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import debounce from 'lodash.debounce'

export default function Whiteboard() {
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContent()
        const interval = setInterval(fetchContent, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/whiteboard')
            const data = await res.json()
            setContent(data.content)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const saveContent = async (newContent: string) => {
        setSaving(true)
        try {
            await fetch('/api/whiteboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            })
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    // Debounced save
    const debouncedSave = useCallback(
        debounce((nextValue: string) => saveContent(nextValue), 1000),
        []
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = e.target.value
        setContent(nextValue)
        debouncedSave(nextValue)
    }

    return (
        <div className="cyber-card flex flex-col gap-4 h-full min-h-[300px] border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center justify-between border-b border-yellow-500/20 pb-2">
                <div className="flex items-center gap-2 text-yellow-500">
                    <StickyNote size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Pizarra de Ideas / Posibles Comidas de Viernes 🍕</h3>
                </div>
                <div className="flex items-center gap-2">
                    {saving ? <Loader2 size={14} className="animate-spin text-yellow-500" /> : <Save size={14} className="text-zinc-600" />}
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">Auto-save</span>
                </div>
            </div>

            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                        <Loader2 className="animate-spin text-yellow-500/50" />
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={handleChange}
                        placeholder="Escribe aquí ideas para el viernes, notas rápidas o lo que pinte..."
                        className="w-full h-full bg-transparent border-none focus:ring-0 text-zinc-200 font-handwriting text-lg resize-none placeholder:text-zinc-700 placeholder:italic"
                        spellCheck={false}
                    />
                )}
            </div>

            <div className="text-[9px] text-zinc-600 font-mono text-right uppercase tracking-tighter">
                Colaborativo en tiempo real
            </div>
        </div>
    )
}
