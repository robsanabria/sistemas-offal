# 🐮 Sistémicos Offal

> Centro de operaciones de oficina: **botonera de audios**, métricas en tiempo real, pizarra colaborativa y un par de juegos para cuando no hay peleas (jeje).

App web hecha con **Next.js 16 + React 19 + Tailwind 4**. Pensada para correr en la oficina: la pestaña estrella es la **Botonera** (un soundboard con ~160 audios) y alrededor hay varias herramientas colaborativas que sincronizan estado vía **Upstash Redis**.

---

## ✨ Funcionalidades

### 🎵 Botonera (lo más usado)
Soundboard con ~160 efectos de sonido. Es la pantalla principal al abrir la app.

- **Asignación de teclas personalizada** → tocá el ícono ⌨ de cualquier pad y apretá la tecla que quieras. Esa tecla queda ligada a ese audio y se reproduce al apretarla desde cualquier parte de la página. Las asignaciones se guardan en tu navegador (`localStorage`), así que persisten entre sesiones.
  - `Esc` mientras asignás → cancela.
  - `Supr` / `Backspace` mientras asignás → borra la tecla de ese pad.
  - Una tecla = un audio (reasignar una tecla la libera del audio anterior).
- **Buscador** para filtrar entre los ~160 audios por nombre.
- **Favoritos** ⭐ → marcá tus audios y filtralos con un click.
- **Volumen** global con mute rápido, y modo **Loop** (bucle).
- **RANDOM** → dispara un audio al azar. **STOP** (o `Esc`) corta todo lo que esté sonando.
- Detección automática de audios faltantes (se marcan como *offline* y se deshabilitan).

### 📊 Dashboard
Tarjetas con métricas y gags de oficina: contadores de ausencias (Andrea / Roberto), contador de velocidad, frase aleatoria de los Simpsons, tarjeta motivacional y un Texto-a-Voz.

### 🤝 Colaborativo
Pizarra blanca compartida, tablero de puntos, "Coffee Board" (a quién le toca el café) y un mood board. El estado se sincroniza entre clientes por *polling* contra la API.

### 🎨 Pictonary
Sala de dibujo colaborativa estilo Pictionary (dibujante + adivinadores, rotación de turnos y puntaje). Backend sobre Redis. ⚠️ *Work in progress — todavía en pulido.*

### 📻 Código Morse
Codificador/decodificador de Morse.

### 🕹️ Arcade
Buscaminas.

---

## 🚀 Puesta en marcha

Requisitos: **Node 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (ver abajo)
#    Creá un archivo .env.local con los valores de Upstash

# 3. Levantar el server de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Comando         | Qué hace                              |
| --------------- | ------------------------------------- |
| `npm run dev`   | Server de desarrollo (Turbopack)      |
| `npm run build` | Build de producción                   |
| `npm run start` | Sirve el build de producción          |
| `npm run lint`  | Linter (ESLint)                       |

---

## 🔧 Variables de entorno

La botonera, el dashboard básico y los juegos funcionan **sin configuración**. Las features colaborativas (Pictonary, pizarra, polling) necesitan una base **Upstash Redis** (el plan gratuito alcanza).

Creá un `.env.local` con:

```env
# Upstash Redis (https://upstash.com → Create database → REST API)
UPSTASH_REDIS_REST_URL=https://tu-instancia.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-token

# Alias que también lee el código (podés repetir los mismos valores)
KV_REST_API_URL=https://tu-instancia.upstash.io
KV_REST_API_TOKEN=tu-token
```

> ⚠️ **Seguridad:** `.env.local` no debe commitearse (ya está en `.gitignore`). Si alguna vez se subió un token, rotalo desde el panel de Upstash.

---

## 🎵 ¿Cómo agrego un audio nuevo a la botonera?

1. Poné el archivo `.mp3` en la carpeta [`public/`](public/).
2. Agregá la ruta al array `sounds` en [`src/components/PrankButton.tsx`](src/components/PrankButton.tsx) (con `/` al inicio, p. ej. `'/mi-audio.mp3'`).
3. Listo — el nombre del botón se genera automáticamente a partir del nombre del archivo.

---

## 🧱 Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, Framer Motion, lucide-react
- **Estado compartido:** Upstash Redis (`@upstash/redis`) vía rutas en `src/app/api/*`
- **Lenguaje:** TypeScript

### Estructura

```
src/
├── app/
│   ├── page.tsx          # Home con la navegación por pestañas
│   ├── api/              # Rutas de backend (room, poll, publish, counters…)
│   └── pictonary/        # Página de la sala de Pictonary
├── components/           # Botonera, contadores, pizarra, juegos, etc.
└── lib/                  # Helpers (kv, wordPool)
```

---

Hecho con 🧉 por [@Robsanabria](https://github.com/Robsanabria).
