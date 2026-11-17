"use client"

import { useEffect, useState } from 'react'
import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, CloudLightning, Droplets, type LucideIcon,
} from 'lucide-react'

// Burzaco (Almirante Brown), donde está la planta. Pronóstico de Open-Meteo:
// gratuito, sin API key y con CORS abierto, así que se pide directo desde el navegador.
const LUGAR = 'Burzaco'
const URL_PRONOSTICO =
  'https://api.open-meteo.com/v1/forecast?latitude=-34.83&longitude=-58.39' +
  '&current=temperature_2m,apparent_temperature,weather_code,is_day' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
  '&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=4'
const REFRESCO_MS = 15 * 60 * 1000

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

interface Dia {
  fecha: string // YYYY-MM-DD
  codigo: number
  max: number
  min: number
  lluvia: number | null
}

interface Pronostico {
  temp: number
  sensacion: number
  codigo: number
  deDia: boolean
  dias: Dia[]
}

// Códigos WMO que devuelve Open-Meteo
function describir(codigo: number, deDia = true): { texto: string; Icono: LucideIcon } {
  if (codigo === 0) return { texto: 'Despejado', Icono: deDia ? Sun : Moon }
  if (codigo === 1) return { texto: 'Mayormente despejado', Icono: deDia ? Sun : Moon }
  if (codigo === 2) return { texto: 'Parcialmente nublado', Icono: deDia ? CloudSun : CloudMoon }
  if (codigo === 3) return { texto: 'Nublado', Icono: Cloud }
  if (codigo === 45 || codigo === 48) return { texto: 'Niebla', Icono: CloudFog }
  if (codigo >= 51 && codigo <= 57) return { texto: 'Llovizna', Icono: CloudDrizzle }
  if (codigo >= 61 && codigo <= 67) return { texto: 'Lluvia', Icono: CloudRain }
  if (codigo >= 71 && codigo <= 77) return { texto: 'Nieve', Icono: CloudSnow }
  if (codigo >= 80 && codigo <= 82) return { texto: 'Chaparrones', Icono: CloudRain }
  if (codigo === 85 || codigo === 86) return { texto: 'Nevadas', Icono: CloudSnow }
  if (codigo >= 95) return { texto: 'Tormenta', Icono: CloudLightning }
  return { texto: 'Sin dato', Icono: Cloud }
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

// La respuesta viene de un servicio externo: se valida la forma antes de usarla
function leer(json: unknown): Pronostico | null {
  const j = json as { current?: Record<string, unknown>; daily?: Record<string, unknown[]> } | null
  const temp = num(j?.current?.temperature_2m)
  const codigo = num(j?.current?.weather_code)
  const fechas = j?.daily?.time
  if (temp === null || codigo === null || !Array.isArray(fechas)) return null

  const dias: Dia[] = []
  fechas.forEach((fecha, i) => {
    const c = num(j?.daily?.weather_code?.[i])
    const max = num(j?.daily?.temperature_2m_max?.[i])
    const min = num(j?.daily?.temperature_2m_min?.[i])
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || c === null || max === null || min === null) return
    dias.push({ fecha, codigo: c, max, min, lluvia: num(j?.daily?.precipitation_probability_max?.[i]) })
  })

  return {
    temp,
    sensacion: num(j?.current?.apparent_temperature) ?? temp,
    codigo,
    deDia: j?.current?.is_day !== 0,
    dias,
  }
}

const nombreDia = (fecha: string) => {
  const [a, m, d] = fecha.split('-').map(Number)
  return DIAS[new Date(a, m - 1, d).getDay()]
}

export default function Clima() {
  // null hasta montar: evita el mismatch de hidratación con la hora del servidor
  const [ahora, setAhora] = useState<Date | null>(null)
  const [pronostico, setPronostico] = useState<Pronostico | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const tick = () => setAhora(new Date())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 1000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [])

  useEffect(() => {
    let vigente = true
    const cargar = async () => {
      try {
        const res = await fetch(URL_PRONOSTICO)
        if (!res.ok) throw new Error(String(res.status))
        const p = leer(await res.json())
        if (!p) throw new Error('respuesta inesperada')
        if (vigente) { setPronostico(p); setError(false) }
      } catch {
        if (vigente) setError(true)
      }
    }
    cargar()
    const t = setInterval(cargar, REFRESCO_MS)
    return () => { vigente = false; clearInterval(t) }
  }, [])

  const fecha = ahora ? `${DIAS[ahora.getDay()]} ${ahora.getDate()} ${MESES[ahora.getMonth()]}` : '–'
  const hora = ahora
    ? `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`
    : '--:--'

  const actual = pronostico ? describir(pronostico.codigo, pronostico.deDia) : null
  const hoy = pronostico?.dias[0]
  const proximos = pronostico?.dias.slice(1, 4) ?? []

  return (
    <section
      aria-label={`Fecha, hora y clima en ${LUGAR}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap"
    >
      {/* Día y hora */}
      <span className="flex items-baseline gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-sky-300">{fecha}</span>
        <span className="text-lg font-extrabold leading-none tabular-nums text-zinc-100">{hora}</span>
        <span className="text-[11px] text-zinc-500">hs</span>
      </span>

      <span className="w-px h-5 bg-white/10" aria-hidden />

      {/* Ahora */}
      {pronostico && actual ? (
        <span
          className="flex items-center gap-1.5"
          title={`${LUGAR}: ${actual.texto}, ${Math.round(pronostico.temp)}° (sensación ${Math.round(pronostico.sensacion)}°)` +
            (hoy ? `. Hoy ${Math.round(hoy.min)}° a ${Math.round(hoy.max)}°` + (hoy.lluvia !== null ? `, lluvia ${hoy.lluvia}%` : '') : '')}
        >
          <actual.Icono size={18} className="text-amber-300" />
          <span className="text-lg font-extrabold leading-none tabular-nums text-zinc-100">{Math.round(pronostico.temp)}°</span>
          <span className="hidden 2xl:inline text-[11px] text-zinc-400">{actual.texto}</span>
          {hoy && (
            <span className="text-[11px] tabular-nums text-zinc-500">
              {Math.round(hoy.max)}° / {Math.round(hoy.min)}°
            </span>
          )}
        </span>
      ) : (
        <span className="text-[11px] text-zinc-500">{error ? 'Clima no disponible' : 'Cargando clima…'}</span>
      )}

      {/* Pronóstico de los próximos días */}
      {proximos.length > 0 && (
        <span className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">
          {proximos.map((d) => {
            const { texto, Icono } = describir(d.codigo)
            return (
              <span
                key={d.fecha}
                className="flex items-center gap-1 text-[11px]"
                title={`${nombreDia(d.fecha)}: ${texto}, ${Math.round(d.min)}° a ${Math.round(d.max)}°` +
                  (d.lluvia !== null ? `, lluvia ${d.lluvia}%` : '')}
              >
                <span className="font-bold uppercase text-zinc-400">{nombreDia(d.fecha)}</span>
                <Icono size={14} className="text-zinc-300" />
                <span className="tabular-nums text-zinc-200">{Math.round(d.max)}°</span>
                <span className="tabular-nums text-zinc-500">{Math.round(d.min)}°</span>
                {d.lluvia !== null && d.lluvia >= 30 && (
                  <span className="flex items-center gap-0.5 tabular-nums text-sky-300">
                    <Droplets size={10} />{d.lluvia}%
                  </span>
                )}
              </span>
            )
          })}
        </span>
      )}
    </section>
  )
}
