import { useEffect, useRef, useState } from 'react';

interface SketchBoardProps {
  roomId: string;
  isDrawer: boolean;
  secretWord?: string;
  onNewRound?: (payload: any) => void;
  onPlayerJoin?: (payload: any) => void;
  onGuess?: (payload: string) => void;
}

export default function SketchBoard({ roomId, isDrawer, secretWord, onNewRound, onPlayerJoin, onGuess }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [guess, setGuess] = useState('');
  const [color, setColor] = useState<string>('#000000');
  const [size, setSize] = useState<number>(4);
  const [messages, setMessages] = useState<string[]>([]);
  const cursorRef = useRef(0);
  const drawingRef = useRef(false);

  // Poll server for events (strokes, guesses, round events)
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/poll?roomId=${roomId}&cursor=${cursorRef.current}`);
        if (!res.ok) return;
        const json = await res.json();
        const events = json.events ?? [];
        const nextCursor = json.nextCursor ?? cursorRef.current;
        for (const ev of events) {
          const { type, payload } = ev;
          if (type === 'stroke') drawRemote(payload);
          else if (type === 'guess') {
            setMessages((prev) => [...prev, payload]);
            if (onGuess) onGuess(payload);
            if (String(payload).toLowerCase() === (secretWord ?? '').toLowerCase()) {
              // optional client notification
            }
          } else if (type === 'new_round') {
            // clear canvas for new round
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              const canvas = canvasRef.current!;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.beginPath();
            }
            if (onNewRound) onNewRound(payload);
          } else if (type === 'player_join') {
            setMessages((prev) => [...prev, `→ ${payload.name} se unió`]);
            if (onPlayerJoin) onPlayerJoin(payload);
          } else if (type === 'clear') {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              const canvas = canvasRef.current!;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.beginPath();
            }
          } else if (type === 'correct_guess') {
            setMessages((prev) => [...prev, `🏆 ${payload.playerId} adivinó: ${payload.word}`]);
          }
        }
        cursorRef.current = nextCursor;
      } catch (err) {
        console.error('Poll error', err);
      }
    };
    poll();
    const iv = setInterval(poll, 500);
    return () => { mounted = false; clearInterval(iv); };
  }, [roomId, secretWord]);

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
    publish({ x, y, color, size, begin: true }, 'stroke');
    drawingRef.current = true;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const moveDrawing = (clientX: number, clientY: number) => {
    if (!isDrawer || !drawingRef.current) return;
    const { x, y } = getCanvasPos(clientX, clientY);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
    publish({ x, y, color, size, begin: false }, 'stroke');
  };

  // mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => startDrawing(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => moveDrawing(e.clientX, e.clientY);
  const handleMouseUp = () => stopDrawing();

  // touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    startDrawing(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    moveDrawing(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => stopDrawing();

  const publish = async (stroke: { x: number; y: number; color?: string; size?: number }, type = 'stroke') => {
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type, payload: stroke }),
    });
  };

  const sendGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDrawer) return; // prevent drawer from guessing
    const playerId = localStorage.getItem('clientId') ?? '';
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type: 'guess', payload: guess, playerId }),
    });
    setGuess('');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isDrawer && secretWord && (
        <p className="text-lg font-mono">Palabra a dibujar: <span className="italic">{secretWord}</span></p>
      )}
      <div className="w-full flex items-center gap-3">
        {isDrawer && secretWord && (
          <p className="text-lg font-mono">Palabra a dibujar: <span className="italic">{secretWord}</span></p>
        )}
        <div className="ml-auto flex items-center gap-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
          <button onClick={() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return; const c = canvasRef.current!; ctx.clearRect(0,0,c.width,c.height);
            // publish clear event
            fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId, type: 'clear' }) });
          }} className="px-2 py-1 bg-white/10 rounded">Clear</button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border bg-white/10 touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {!isDrawer && (
        <form onSubmit={sendGuess} className="flex gap-2 mt-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Adivina la palabra..."
            className="px-2 py-1 rounded bg-white/20 focus:outline-none"
            required
          />
          <button type="submit" className="px-4 py-1 bg-cyan-600 rounded hover:bg-cyan-500">
            Enviar
          </button>
        </form>
      )}

      <div className="w-full max-w-md h-32 overflow-y-auto bg-white/5 p-2 rounded mt-2">
        {messages.map((msg, i) => (
          <p key={i}>📣 {msg}</p>
        ))}
      </div>
    </div>
  );
}
