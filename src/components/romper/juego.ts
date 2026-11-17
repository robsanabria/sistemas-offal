// Modo "romper": un muñequito que se mueve con WASD/flechas, apunta con el mouse y
// dispara. Las balas rompen lo que tocan de la página: el elemento se oculta y saltan
// pedazos. Al salir se restaura todo.
//
// El personaje y la mecánica de disparo (retroceso, destello, humo) están basados en el
// pen de Andrew Williams, que lo publica como plantilla de uso libre:
// https://codepen.io/Andrew-Williams-the-styleful/pen/EaWzYPv

const VEL = 0.8
const FRICCION = 0.8
const VEL_BALA = 22
const RETROCESO = 5
const GRAVEDAD = 0.55
const MAX_PARTICULAS = 400
const ATTR_ROTO = 'data-rp-roto'

// Qué se puede romper, de más específico a más general. Gana el primero que matchea.
const PAD = '.grid.custom-scrollbar > .group'
const PRIORIDAD = [PAD, 'li', 'button, a, img, video, input, select, textarea, h1, h2, h3, p, label']
// Lo que tiene que quedar roto (en pantalla) para dar por terminado el modo
const META = `${PAD}, li, button, a, img, video, input, h1, h2, h3, p, label`

type Rompible = HTMLElement | SVGElement

interface Particula {
  el: HTMLElement
  x: number; y: number
  vx: number; vy: number
  rot: number; vr: number
  vida: number; fade: number
  gravedad: number; friccion: number
}

interface Bala {
  el: HTMLElement
  x: number; y: number
  ang: number
}

export interface OpcionesJuego {
  capa: HTMLElement   // overlay que recibe el mouse
  mundo: HTMLElement  // contenedor de personaje, balas y pedazos (sin eventos)
  mouse: { x: number; y: number }
  onRoto: (total: number) => void
  onFin: () => void
  onSalir: () => void
}

const azar = (min: number, max: number) => Math.random() * (max - min) + min

function alfa(color: string): number {
  if (color === 'transparent') return 0
  const barra = color.match(/\/\s*([\d.]+)(%?)\s*\)/)
  if (barra) return Number(barra[1]) / (barra[2] ? 100 : 1)
  const rgba = color.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)/)
  return rgba ? Number(rgba[1]) : 1
}

export function iniciarJuego({ capa, mundo, mouse, onRoto, onFin, onSalir }: OpcionesJuego): () => void {
  const teclas = new Set<string>()
  const balas: Bala[] = []
  const destellos: { el: HTMLElement; cuadros: number }[] = []
  const particulas: Particula[] = []
  // Lo roto se marca con un atributo (ver ROMPER_CSS) en vez de tocar su `style`:
  // React no lo pisa y restaurar es solo quitarlo.
  const rotos = new Set<Rompible>()
  let terminado = false
  let revisarEn = 0 // cuadros hasta revisar si queda algo entero (0 = no hay revisión pendiente)

  const crear = (clase: string) => {
    const d = document.createElement('div')
    d.className = clase
    mundo.appendChild(d)
    return d
  }

  // ── Personaje ────────────────────────────────────────────────────
  const jugador = crear('rp-jugador')
  jugador.innerHTML = `
    <div class="rp-gorra"></div>
    <div class="rp-ojo d"></div><div class="rp-ojo i"></div>
    <div class="rp-boca"></div>
    <div class="rp-remera"><i></i></div>
    <div class="rp-brazo d"><div class="rp-manga"></div><div class="rp-arma"></div></div>
    <div class="rp-brazo i"><div class="rp-manga"></div></div>
    <div class="rp-pierna d"><i></i></div>
    <div class="rp-pierna i"><i></i></div>`
  const brazoD = jugador.querySelector<HTMLElement>('.rp-brazo.d')!
  const brazoI = jugador.querySelector<HTMLElement>('.rp-brazo.i')!
  const piernaD = jugador.querySelector<HTMLElement>('.rp-pierna.d')!
  const piernaI = jugador.querySelector<HTMLElement>('.rp-pierna.i')!

  const j = {
    x: window.innerWidth / 2, y: window.innerHeight / 2,
    vx: 0, vy: 0, lado: 1, ang: 0,
    t: 0, brazoI: 0, piernaD: 0, piernaI: 0, salto: 0, retroceso: 0,
  }

  // hombro del brazo que apunta, en coordenadas de pantalla
  const hombro = () => ({ x: j.x + 16.6 * j.lado, y: j.y + 5.4 })

  const actualizarJugador = (k: number) => {
    const der = teclas.has('der'), izq = teclas.has('izq'), arr = teclas.has('arr'), aba = teclas.has('aba')
    if (der) j.vx += VEL * k; else if (izq) j.vx -= VEL * k
    if (arr) j.vy -= VEL * k; else if (aba) j.vy += VEL * k
    j.x += j.vx * k
    j.y += j.vy * k
    const f = Math.pow(FRICCION, k)
    j.vx *= f
    j.vy *= f

    // no salir de la pantalla
    const mx = 20, my = 26
    if (j.x < mx) { j.x = mx; j.vx = 0 } else if (j.x > window.innerWidth - mx) { j.x = window.innerWidth - mx; j.vx = 0 }
    if (j.y < my) { j.y = my; j.vy = 0 } else if (j.y > window.innerHeight - my) { j.y = window.innerHeight - my; j.vy = 0 }

    j.lado = mouse.x < j.x ? -1 : 1
    const h = hombro()
    j.ang = Math.atan2(mouse.y - h.y, mouse.x - h.x)
    const rot = (j.ang - Math.PI / 2) * j.lado

    if (der || izq || arr || aba) {
      j.t += (Math.PI / 10) * k
      j.brazoI = Math.sin(j.t) / 2
      j.piernaD = Math.sin(j.t * 0.9) * 0.5
      j.piernaI = -j.piernaD
      j.salto = Math.sin(j.t) * 5
    } else {
      const r = 1 - Math.pow(0.9, k)
      j.brazoI -= j.brazoI * r
      j.piernaD -= j.piernaD * r
      j.piernaI -= j.piernaI * r
      j.salto -= j.salto * r
    }
    j.retroceso *= Math.pow(0.75, k)

    jugador.style.transform = `translate(${j.x}px, ${j.y}px) translate(-50%, -${50 + j.salto}%) scaleX(${j.lado})`
    brazoD.style.transform =
      `translate(${Math.sin(rot) * j.retroceso}px, ${-Math.cos(rot) * j.retroceso}px) rotate(${rot}rad)`
    brazoI.style.transform = `rotate(${j.brazoI}rad)`
    piernaD.style.transform = `rotate(${j.piernaD}rad)`
    piernaI.style.transform = `rotate(${j.piernaI}rad)`
  }

  // ── Partículas (humo y pedazos) ──────────────────────────────────
  const pintar = (p: Particula) => {
    p.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.rot}rad)`
    p.el.style.opacity = String(Math.min(1, p.vida * 2))
  }

  const humo = (x: number, y: number, ang: number, intensidad: number) => {
    const cantidad = Math.round(azar(2, 4))
    for (let i = 0; i < cantidad; i++) {
      const el = crear('rp-humo')
      const lado = azar(5, 10) * intensidad
      el.style.width = el.style.height = `${lado}px`
      const dir = ang + azar(-0.5, 0.5)
      const vel = azar(5, 10) * intensidad
      const p: Particula = {
        el, x, y, vx: Math.cos(dir) * vel, vy: Math.sin(dir) * vel,
        rot: 0, vr: 0, vida: 0.5, fade: 0.0175, gravedad: 0, friccion: 0.85,
      }
      pintar(p)
      particulas.push(p)
    }
  }

  const actualizarParticulas = (k: number) => {
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i]
      p.vy += p.gravedad * k
      p.x += p.vx * k
      p.y += p.vy * k
      const f = Math.pow(p.friccion, k)
      p.vx *= f
      p.vy *= f
      p.rot += p.vr * k
      p.vida -= p.fade * k
      if (p.vida <= 0 || p.y > window.innerHeight + 80) {
        p.el.remove()
        particulas.splice(i, 1)
      } else {
        pintar(p)
      }
    }
  }

  // ── Romper elementos de la página ────────────────────────────────
  const esGrande = (el: Element) => {
    const r = el.getBoundingClientRect()
    return r.width * r.height > window.innerWidth * window.innerHeight * 0.35
  }

  // De lo que tocó la bala, qué elemento se rompe (o null si es fondo / un contenedor grande)
  const resolver = (el: Element): Rompible | null => {
    for (const selector of PRIORIDAD) {
      const t = el.closest<HTMLElement>(selector)
      if (t && !esGrande(t)) return t
    }
    if (el === document.body || el === document.documentElement) return null
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return null
    // suelto: textos sueltos y cajitas con fondo o borde propio (chips, buscador).
    // Las filas y contenedores invisibles no se rompen: la bala sigue de largo.
    const r = el.getBoundingClientRect()
    const area = r.width * r.height
    if (el.childElementCount === 0) {
      return area < window.innerWidth * window.innerHeight * 0.15 && (el.textContent ?? '').trim() ? el : null
    }
    const cs = getComputedStyle(el)
    const conCaja = alfa(cs.backgroundColor) > 0 || (parseFloat(cs.borderTopWidth) > 0 && alfa(cs.borderTopColor) > 0)
    return conCaja && area <= 60_000 ? el : null
  }

  const objetivoEn = (x: number, y: number): Rompible | null => {
    const arriba = document.elementsFromPoint(x, y).find((el) => !capa.contains(el))
    const objetivo = arriba ? resolver(arriba) : null
    return objetivo && !rotos.has(objetivo) ? objetivo : null
  }

  const colorDe = (el: Rompible): string => {
    const icono = el.matches(PAD) ? el.querySelector('svg') : null
    if (icono) return getComputedStyle(icono).color // color de la categoría del pad
    const cs = getComputedStyle(el)
    return [cs.backgroundColor, cs.borderTopColor, cs.color].find((c) => alfa(c) >= 0.35) ?? '#c6f135'
  }

  const romper = (el: Rompible, x: number, y: number, ang: number) => {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return

    // si es (o envuelve) una imagen, los pedazos llevan el recorte de la imagen
    const img = el instanceof HTMLImageElement ? el : el.querySelector('img')
    const ri = img?.currentSrc ? img.getBoundingClientRect() : null
    const conImagen = !!ri && ri.width * ri.height > r.width * r.height * 0.5
    const color = conImagen ? '' : colorDe(el)

    // pedazos más o menos cuadrados (~22 px), con tope para no llenar la pantalla
    const lleno = particulas.length > MAX_PARTICULAS
    let cols = lleno ? 2 : Math.max(2, Math.min(8, Math.round(r.width / 22)))
    let filas = lleno ? 1 : Math.max(1, Math.min(5, Math.round(r.height / 22)))
    while (cols * filas > 24) { if (cols >= filas) cols--; else filas-- }
    const pw = r.width / cols, ph = r.height / filas

    for (let c = 0; c < cols; c++) {
      for (let f = 0; f < filas; f++) {
        const el2 = crear('rp-pedazo')
        const px = r.left + c * pw, py = r.top + f * ph
        el2.style.width = `${pw}px`
        el2.style.height = `${ph}px`
        if (conImagen && ri && img) {
          el2.style.backgroundImage = `url(${JSON.stringify(img.currentSrc)})`
          el2.style.backgroundSize = `${ri.width}px ${ri.height}px`
          el2.style.backgroundPosition = `${ri.left - px}px ${ri.top - py}px`
        } else {
          el2.style.background = color
          el2.style.filter = `brightness(${azar(0.75, 1.25)})`
        }
        const cx = px + pw / 2, cy = py + ph / 2
        const dx = cx - x, dy = cy - y
        const d = Math.hypot(dx, dy) || 1
        const empuje = azar(2, 7)
        const p: Particula = {
          el: el2, x: cx, y: cy,
          vx: (dx / d) * empuje + Math.cos(ang) * 3 + azar(-1.5, 1.5),
          vy: (dy / d) * empuje + Math.sin(ang) * 3 - azar(1, 4),
          rot: 0, vr: azar(-0.25, 0.25),
          vida: 1, fade: azar(0.012, 0.02), gravedad: GRAVEDAD, friccion: 0.99,
        }
        pintar(p)
        particulas.push(p)
      }
    }

    rotos.add(el)
    el.setAttribute(ATTR_ROTO, '')
    humo(x, y, ang + Math.PI, 1.4)
    onRoto(rotos.size)
    revisarEn = 20
  }

  // ¿Queda en pantalla algo entero de lo que cuenta para "romper todo"?
  const quedaAlgo = (): boolean => {
    for (const el of document.querySelectorAll<HTMLElement>(META)) {
      if (capa.contains(el) || esGrande(el)) continue
      const r = el.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) continue
      // lo oculto (roto) o tapado por otra cosa no aparece en el hit-test
      const arriba = document.elementsFromPoint(cx, cy).find((e) => !capa.contains(e))
      if (arriba && (arriba === el || el.contains(arriba))) return true
    }
    return false
  }

  // ── Balas ────────────────────────────────────────────────────────
  const pintarBala = (b: Bala) => {
    b.el.style.transform = `translate(${b.x}px, ${b.y}px) translate(-50%, -50%) rotate(${b.ang}rad)`
  }

  const disparar = () => {
    if (terminado) return
    const h = hombro()
    const ang = Math.atan2(mouse.y - h.y, mouse.x - h.x)
    const x = h.x + Math.cos(ang) * 30, y = h.y + Math.sin(ang) * 30

    const destello = crear('rp-destello')
    destello.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    destellos.push({ el: destello, cuadros: 0 })

    // Lo que está debajo del arma se rompe en el acto: si no, la bala nacería
    // más allá de un elemento chico pegado al personaje y nunca lo tocaría.
    let aQuemarropa: Rompible | null = null
    for (let d = 6; d <= 30 && !aQuemarropa; d += 8) {
      aQuemarropa = objetivoEn(h.x + Math.cos(ang) * d, h.y + Math.sin(ang) * d)
    }
    if (aQuemarropa) {
      romper(aQuemarropa, x, y, ang)
    } else {
      const b: Bala = { el: crear('rp-bala'), x, y, ang }
      pintarBala(b)
      balas.push(b)
    }

    j.retroceso = RETROCESO
    j.vx -= Math.cos(ang) * 2.5
    j.vy -= Math.sin(ang) * 2.5
    humo(x, y, ang, 1)

    try {
      const audio = new Audio('/gunshot.mp3')
      audio.volume = 0.2
      audio.play().catch(() => {})
    } catch { /* sin audio no pasa nada */ }
  }

  const actualizarBalas = (k: number) => {
    // el destello del disparo dura un par de cuadros
    for (let i = destellos.length - 1; i >= 0; i--) {
      if (++destellos[i].cuadros > 2) { destellos[i].el.remove(); destellos.splice(i, 1) }
    }

    for (let i = balas.length - 1; i >= 0; i--) {
      const b = balas[i]

      // avanza en pasos cortos para no atravesar elementos chicos
      const pasos = Math.max(1, Math.ceil((VEL_BALA * k) / 10))
      const paso = (VEL_BALA * k) / pasos
      let viva = true
      for (let s = 0; s < pasos && viva; s++) {
        b.x += Math.cos(b.ang) * paso
        b.y += Math.sin(b.ang) * paso
        if (b.x < 0 || b.y < 0 || b.x > window.innerWidth || b.y > window.innerHeight) {
          viva = false
        } else {
          const objetivo = objetivoEn(b.x, b.y)
          if (objetivo) { romper(objetivo, b.x, b.y, b.ang); viva = false }
        }
      }
      if (viva) pintarBala(b); else { b.el.remove(); balas.splice(i, 1) }
    }
  }

  // ── Bucle ────────────────────────────────────────────────────────
  let raf = 0
  let ultimo = performance.now()
  const cuadro = (ahora: number) => {
    const k = Math.min(3, (ahora - ultimo) / (1000 / 60)) // 1 = un cuadro a 60 fps
    ultimo = ahora
    actualizarJugador(k)
    actualizarBalas(k)
    actualizarParticulas(k)
    if (revisarEn > 0 && --revisarEn === 0 && !terminado && !quedaAlgo()) {
      terminado = true
      onFin()
    }
    raf = requestAnimationFrame(cuadro)
  }
  raf = requestAnimationFrame(cuadro)

  // ── Entradas ─────────────────────────────────────────────────────
  const TECLAS: Record<string, string> = {
    KeyW: 'arr', ArrowUp: 'arr', KeyS: 'aba', ArrowDown: 'aba',
    KeyA: 'izq', ArrowLeft: 'izq', KeyD: 'der', ArrowRight: 'der',
  }

  // En captura y frenando la propagación: mientras dura el modo, las teclas no
  // disparan los audios asignados en la botonera.
  const alBajar = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    e.stopPropagation()
    if (e.code === 'Escape') { onSalir(); return }
    if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) disparar(); return }
    const t = TECLAS[e.code]
    if (t) { e.preventDefault(); teclas.add(t) }
  }
  const alSoltar = (e: KeyboardEvent) => {
    const t = TECLAS[e.code]
    if (t) { e.stopPropagation(); teclas.delete(t) }
  }
  const alMover = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
  const alApretar = (e: PointerEvent) => {
    if ((e.target as Element).closest('[data-rp-hud]')) return
    e.preventDefault()
    mouse.x = e.clientX
    mouse.y = e.clientY
    disparar()
  }
  const sinMenu = (e: Event) => e.preventDefault()
  const alPerderFoco = () => teclas.clear()

  window.addEventListener('keydown', alBajar, true)
  window.addEventListener('keyup', alSoltar, true)
  window.addEventListener('pointermove', alMover)
  window.addEventListener('blur', alPerderFoco)
  capa.addEventListener('pointerdown', alApretar)
  capa.addEventListener('contextmenu', sinMenu)

  // ── Detener: saca todo y deja la página como estaba ──────────────
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', alBajar, true)
    window.removeEventListener('keyup', alSoltar, true)
    window.removeEventListener('pointermove', alMover)
    window.removeEventListener('blur', alPerderFoco)
    capa.removeEventListener('pointerdown', alApretar)
    capa.removeEventListener('contextmenu', sinMenu)
    for (const el of rotos) el.removeAttribute(ATTR_ROTO)
    mundo.replaceChildren()
  }
}

// Estilos del personaje, las balas y los pedazos
export const ROMPER_CSS = `
/* Lo roto desaparece al instante, hijos incluidos. Sin transición: con transition-all
   seguiría visible (y rompible) unos 200 ms. */
[${ATTR_ROTO}], [${ATTR_ROTO}] * { visibility: hidden !important; transition: none !important; }

.rp-mundo { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.rp-mundo > * { position: absolute; left: 0; top: 0; will-change: transform; }

.rp-jugador { width: 35px; height: 45px; background: #fff; border-radius: 10px; z-index: 5; }
.rp-jugador > * { position: absolute; }
.rp-jugador::after {
  content: ''; position: absolute; top: 115%; left: 50%; transform: translateX(-50%);
  width: 100%; height: 10px; border-radius: 50%; background: rgba(0, 0, 0, 0.35); z-index: -2;
}
.rp-gorra { top: 15%; transform: translateY(-100%); width: 100%; height: 34%; background: #d32c1b; border-radius: 10px 10px 0 0; }
.rp-gorra::after {
  content: ''; position: absolute; top: 100%; left: 100%; width: 35%; height: 2px;
  background: #d32c1b; transform: translateY(-100%);
}
.rp-ojo { width: 5px; height: 5px; background: #000; top: 25%; }
.rp-ojo.d { right: 10%; }
.rp-ojo.i { right: 50%; }
.rp-boca { top: 40%; left: 65%; width: 20%; height: 2px; background: #000; }
.rp-remera {
  bottom: -1px; left: 50%; width: 105%; height: 50%; transform: translateX(-50%);
  background: #cf2213; border-radius: 0 0 10px 10px; overflow: hidden;
}
.rp-remera > i { position: absolute; left: 60%; top: 0; width: 40%; height: 99%; transform: translateX(-50%); background: #fff5f4; }
.rp-brazo { top: 60%; width: 25%; height: 40%; background: #fff; border-radius: 10px; transform-origin: 50% 5%; }
.rp-brazo.d { right: -10%; }
.rp-brazo.i { left: -5%; }
.rp-manga { position: absolute; top: 0; left: 0; width: 100%; height: 50%; background: #e31b15; border-radius: 10px 10px 0 0; }
.rp-arma { position: absolute; top: 80%; left: 50%; width: 120%; height: 95%; transform: translateX(-50%); background: #111; border-radius: 2px; }
.rp-pierna { top: 80%; width: 25%; height: 45%; background: #fff; border-radius: 10px; transform-origin: 50% 5%; z-index: -1; }
.rp-pierna.d { right: 5%; }
.rp-pierna.i { left: 10%; }
.rp-pierna > i { position: absolute; top: 0; left: 0; width: 100%; height: 80%; background: #4093bd; border-radius: 10px 10px 0 0; }

.rp-bala { width: 18px; height: 8px; background: #fde047; border-radius: 2px; z-index: 10; }
.rp-destello { width: 32px; height: 32px; border-radius: 50%; background: #fff; z-index: 9; }
.rp-humo { background: silver; border-radius: 50%; z-index: 4; }
.rp-pedazo { border-radius: 2px; background-repeat: no-repeat; z-index: 3; }
`
