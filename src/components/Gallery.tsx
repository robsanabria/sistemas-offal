'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Photo {
    src: string
    width: number
    height: number
    caption?: string
}

// images served from /public — sumar `caption` para que aparezca el epígrafe
const IMAGES: Photo[] = [
    { src: '/05ac4b22-b5e6-42ca-aca5-5e2b0997dadf.jpg', width: 1024, height: 1536 },
    { src: '/658ad0a2-7c16-4182-b78e-aab7d49499a2.jpg', width: 1024, height: 1536 },
    { src: '/fb49da52-7c3a-4746-ba6f-3669f82ac4f6.jpg', width: 1024, height: 1536 },
    { src: '/conAbel.jpeg', width: 1206, height: 775, caption: 'Con Abel' },
    { src: '/100626621_123695632676472_1536639118396620800_n.jpg', width: 1440, height: 960 },
    { src: '/broli.jpeg', width: 826, height: 777, caption: 'Broli' },
    { src: '/andrer.jpeg', width: 1086, height: 1448 },
    { src: '/galeria/oficina-retro.jpg', width: 1411, height: 1115 },
    { src: '/galeria/retrato-lentes.jpg', width: 1076, height: 1462 },
    { src: '/galeria/pizza.jpg', width: 1200, height: 1600 },
    { src: '/galeria/ecografia.jpg', width: 789, height: 1024 },
    { src: '/galeria/pan.jpg', width: 960, height: 1280 },
]

const SWIPE_THRESHOLD = 50

// 'strip': tira angosta — columna lateral en desktop, fila con scroll horizontal en mobile
export default function Gallery({ layout = 'grid' }: { layout?: 'grid' | 'strip' }) {
    const strip = layout === 'strip'
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const touchStartX = useRef<number | null>(null)

    const close = useCallback(() => setOpenIndex(null), [])
    const prev = useCallback(
        () => setOpenIndex((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length)),
        []
    )
    const next = useCallback(
        () => setOpenIndex((i) => (i === null ? i : (i + 1) % IMAGES.length)),
        []
    )

    // keyboard navigation + scroll lock while the lightbox is open
    useEffect(() => {
        if (openIndex === null) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
            if (e.key === 'Escape') close()
        }
        window.addEventListener('keydown', handler)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', handler)
            document.body.style.overflow = prevOverflow
        }
    }, [openIndex, prev, next, close])

    return (
        <section aria-label="Galería de imágenes">
            <div className={`flex items-baseline justify-between ${strip ? 'mb-3' : 'mb-6'}`}>
                <h2 className="text-[15px] font-semibold tracking-tight text-zinc-100">Galería</h2>
                <span className="text-xs text-zinc-500 font-mono">{IMAGES.length} fotos</span>
            </div>

            <div className={strip ? 'flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0' : 'columns-2 md:columns-3 xl:columns-4 gap-4'}>
                {IMAGES.map((photo, idx) => (
                    <button
                        key={photo.src}
                        onClick={() => setOpenIndex(idx)}
                        aria-label={`Ampliar ${photo.caption ?? `foto ${idx + 1}`}`}
                        className={`group relative block overflow-hidden ${strip ? 'w-40 shrink-0 lg:w-full' : 'w-full mb-4 break-inside-avoid'} rounded-xl border border-white/10 bg-white/[0.03] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.caption ?? `Foto ${idx + 1}`}
                            width={photo.width}
                            height={photo.height}
                            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                            draggable={false}
                            className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {photo.caption && (
                            <span className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2 text-left text-xs font-medium text-white bg-gradient-to-t from-black/70 to-transparent">
                                {photo.caption}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Portal al body: dentro de un contenedor sticky el z-index queda encerrado y los pads lo tapan */}
            {openIndex !== null && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Foto ampliada"
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    onClick={close}
                    onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
                    onTouchEnd={(e) => {
                        if (touchStartX.current === null) return
                        const dx = e.changedTouches[0].clientX - touchStartX.current
                        touchStartX.current = null
                        if (dx > SWIPE_THRESHOLD) prev()
                        if (dx < -SWIPE_THRESHOLD) next()
                    }}
                >
                    <button
                        aria-label="Cerrar"
                        onClick={close}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <button
                        aria-label="Anterior"
                        onClick={(e) => { e.stopPropagation(); prev() }}
                        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    <Image
                        src={IMAGES[openIndex].src}
                        alt={IMAGES[openIndex].caption ?? `Foto ${openIndex + 1} ampliada`}
                        width={IMAGES[openIndex].width}
                        height={IMAGES[openIndex].height}
                        sizes="100vw"
                        priority
                        onClick={(e) => e.stopPropagation()}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />

                    <button
                        aria-label="Siguiente"
                        onClick={(e) => { e.stopPropagation(); next() }}
                        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={22} />
                    </button>

                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-400">
                        {IMAGES[openIndex].caption && <span className="text-zinc-200">{IMAGES[openIndex].caption} · </span>}
                        {openIndex + 1} / {IMAGES.length}
                    </span>
                </div>,
                document.body
            )}
        </section>
    )
}
