'use client'

import { useState, useEffect, useCallback } from 'react'

// Audios grabados con el micrófono. Viven solo en el navegador (IndexedDB):
// no se suben a ningún lado y vencen solos a las 24 h.

export const REC_PREFIX = 'rec:'
export const REC_TTL_MS = 24 * 60 * 60 * 1000

const DB_NAME = 'botonera'
const STORE = 'grabados'

interface StoredRecording {
  id: string
  name: string
  blob: Blob
  createdAt: number
}

export interface Recording {
  id: string
  src: string      // `rec:<id>` — clave estable para favoritos/teclas
  name: string
  url: string      // object URL para reproducir
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
  )
}

async function listStored(): Promise<StoredRecording[]> {
  const all = await tx<StoredRecording[]>('readonly', (s) => s.getAll())
  const now = Date.now()
  const expired = all.filter((r) => now - r.createdAt > REC_TTL_MS)
  await Promise.all(expired.map((r) => tx('readwrite', (s) => s.delete(r.id))))
  return all.filter((r) => !expired.includes(r)).sort((a, b) => b.createdAt - a.createdAt)
}

const toRecording = (r: StoredRecording): Recording => ({
  id: r.id,
  src: REC_PREFIX + r.id,
  name: r.name,
  url: URL.createObjectURL(r.blob),
  createdAt: r.createdAt,
})

export function useRecordedSounds() {
  const [recorded, setRecorded] = useState<Recording[]>([])

  useEffect(() => {
    if (typeof indexedDB === 'undefined') return
    let urls: string[] = []
    listStored()
      .then((list) => {
        const recs = list.map(toRecording)
        urls = recs.map((r) => r.url)
        setRecorded(recs)
      })
      .catch(() => {})
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const addRecorded = useCallback(async (blob: Blob, name: string) => {
    const stored: StoredRecording = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Grabación',
      blob,
      createdAt: Date.now(),
    }
    await tx('readwrite', (s) => s.put(stored))
    setRecorded((prev) => [toRecording(stored), ...prev])
  }, [])

  const removeRecorded = useCallback(async (id: string) => {
    await tx('readwrite', (s) => s.delete(id))
    setRecorded((prev) => {
      prev.filter((r) => r.id === id).forEach((r) => URL.revokeObjectURL(r.url))
      return prev.filter((r) => r.id !== id)
    })
  }, [])

  return { recorded, addRecorded, removeRecorded }
}
