import { useEffect, useRef, useState } from 'react';
import { Eraser, Send, Pencil } from 'lucide-react';

export type ChatMsg = {
  kind: 'guess' | 'correct' | 'join' | 'leave' | 'system';
  name?: string;
  text?: string;
  word?: string;
};

interface SketchBoardProps {
  roomId: string;
  isDrawer: boolean;
  secretWord?: string;
  onNewRound?: () => void;
  onMessage?: (msg: ChatMsg) => void;
}

const PALETTE = ['#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#ffffff'];

export default function SketchBoard({ roomId, isDrawer, secretWord, onNewRound, onMessage }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [guess, setGuess] = useState('');
  const [color, setColor] = useState<string>('#0f172a');
  const [size, setSize] = useState<number>(4);
  const cursorRef = useRef(0);
  const drawingRef = useRef(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    const c = canvasRef.current;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
  };

  // Poll server for events (strokes, guesses, round events)
  useEffect(() => {
    // al (re)entrar a una sala empezamos desde el principio del buffer
    cursorRef.current = 0;
    let iv: ReturnType<typeof setInterval> | null = null;
    const poll = async () => {
      try {
        if (document.hidden) return;
        const res = await fetch(`/api/poll?roomId=${roomId}&cursor=${cursorRef.current}`);
        if (!res.ok) return;
        const json = await res.json();
        const events = json.events ?? [];
        const nextCursor = json.nextCursor ?? cursorRef.current;
        for (const ev of events) {
          const { type, payload } = ev;
          if (type === 'stroke') {
            const localClientId = localStorage.getItem('clientId') ?? '';
            if (payload?.playerId && payload.playerId === localClientId) continue;
            drawRemote(payload);
          } else if (type === 'guess') {
            // payload puede ser string (legacy) u objeto { name, text }
            const name = typeof payload === 'object' ? payload?.name : undefined;
            const text = typeof payload === 'object' ? payload?.text : String(payload ?? '');
            onMessage?.({ kind: 'guess', name, text });
          } else if (type === 'correct_guess') {
            onMessage?.({ kind: 'correct', name: payload?.name ?? payload?.playerId, word: payload?.word });
          } else if (type === 'new_round') {
            clearCanvas();
            onNewRound?.();
          } else if (type === 'room_reset') {
            clearCanvas();
            onMessage?.({ kind: 'system', text: 'Sala reiniciada' });
          } else if (type === 'player_join') {
            onMessage?.({ kind: 'join', name: payload?.name });
          } else if (type === 'player_leave') {
            onMessage?.({ kind: 'leave', name: payload?.name ?? payload?.id });
          } else if (type === 'clear') {
            clearCanvas();
          }
        }
        cursorRef.current = nextCursor;
      } catch (err) {
        console.error('Poll error', err);
      }
    };

    const start = () => { poll(); iv = setInterval(poll, 1000); };
    const stop = () => { if (iv) { clearInterval(iv); iv = null; } };
    if (!document.hidden) start();
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const drawRemote = (stroke: { x: number; y: number; color?: string; size?: number; begin?: boolean }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = stroke.color ?? '#000';
    ctx.lineWidth = stroke.size ?? 4;
    if (stroke.begin) {
      ctx.beginPath();
      ctx.moveTo(stroke.x, stroke.y);
    } else {
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
    }
  };

  // Setup canvas for devicePixelRatio and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${Math.round(rect.width)}px`;
      canvas.style.height = `${Math.round(rect.height)}px`;
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    if (!canvas.style.height) canvas.style.height = '420px';
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getCanvasPos = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (clientX: number, clientY: number) => {
    if (!isDrawer) return;
    const { x, y } = getCanvasPos(clientX, clientY);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    const playerId = localStorage.getItem('clientId') ?? '';
    publish({ x, y, color, size, begin: true, playerId }, 'stroke');
    drawingRef.current = true;
  };

  const stopDrawing = () => { drawingRef.current = false; };

  const moveDrawing = (clientX: number, clientY: number) => {
    if (!isDrawer || !drawingRef.current) return;
    const { x, y } = getCanvasPos(clientX, clientY);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
    const playerId = localStorage.getItem('clientId') ?? '';
    publish({ x, y, color, size, begin: false, playerId }, 'stroke');
  };

  const handleMouseDown = (e: React.MouseEvent) => startDrawing(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => moveDrawing(e.clientX, e.clientY);
  const handleMouseUp = () => stopDrawing();
  const handleTouchStart = (e: React.TouchEvent) => { if (!e.touches.length) return; e.preventDefault(); startDrawing(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchMove = (e: React.TouchEvent) => { if (!e.touches.length) return; e.preventDefault(); moveDrawing(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchEnd = () => stopDrawing();

  const publish = async (stroke: { x: number; y: number; color?: string; size?: number; begin?: boolean; playerId?: string }, type = 'stroke') => {
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type, payload: stroke }),
    });
  };

  const clearAndBroadcast = () => {
    clearCanvas();
    const playerId = localStorage.getItem('clientId') ?? '';
    fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId, type: 'clear', playerId }) });
  };

  const sendGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDrawer || !guess.trim()) return;
    const playerId = localStorage.getItem('clientId') ?? '';
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type: 'guess', payload: guess.trim(), playerId }),
    });
    setGuess('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de herramientas del dibujante */}
      {isDrawer && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-cyan-400 scale-110' : 'border-white/20'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-1">
            <Pencil size={14} className="text-zinc-500" />
            <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} className="w-24 accent-cyan-500" />
            <span className="text-[10px] font-mono text-zinc-500 w-5">{size}</span>
          </div>
          <button onClick={clearAndBroadcast} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-all">
            <Eraser size={14} /> Limpiar
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`rounded-xl bg-white touch-none w-full shadow-2xl ${isDrawer ? 'cursor-crosshair border-2 border-cyan-500/40' : 'border border-white/10 cursor-not-allowed'}`}
        style={{ width: '100%', height: '420px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {!isDrawer && (
        <form onSubmit={sendGuess} className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Escribí tu respuesta…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
          />
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors active:scale-95">
            <Send size={15} /> Enviar
          </button>
        </form>
      )}
    </div>
  );
}
