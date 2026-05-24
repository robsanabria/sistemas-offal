'use client'

import { useEffect, useState } from 'react'
import { RadioTower } from 'lucide-react'

type TickerEvent = {
    id: string;
    message: string;
    timestamp: number;
}

export default function GlobalTicker() {
    const [events, setEvents] = useState<TickerEvent[]>([])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/ticker')
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (e) {
            console.error('Ticker fetch error', e)
        }
    }

    useEffect(() => {
        fetchEvents()
        const int = setInterval(fetchEvents, 5000)
        return () => clearInterval(int)
    }, [])

    if (events.length === 0) return null

    return (
        <div className="w-full cyber-card !p-0 overflow-hidden relative flex items-center border-l-4 border-l-amber-500 mb-6 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            
            <div className="shrink-0 bg-amber-500 text-black px-4 py-2 font-black tracking-widest flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                <RadioTower size={18} className="animate-pulse" />
                <span>SYS.COM</span>
            </div>

            <div className="flex-grow overflow-hidden relative flex items-center h-full">
                {/* Marquee Animation */}
                <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] gap-12 px-6">
                    {events.map((ev, i) => (
                        <div key={ev.id} className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold opacity-50">&bull;</span>
                            <span className="text-zinc-300 font-mono text-sm tracking-wide">
                                {ev.message}
                            </span>
                        </div>
                    ))}
                    {/* Duplicate for infinite effect */}
                    {events.map((ev, i) => (
                        <div key={`${ev.id}-dup`} className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold opacity-50">&bull;</span>
                            <span className="text-zinc-300 font-mono text-sm tracking-wide">
                                {ev.message}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    )
}
