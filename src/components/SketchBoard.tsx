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
  const [messages, setMessages] = useState<string[]>([]);
  const cursorRef = useRef(0);

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
            if (payload.toLowerCase() === (secretWord ?? '').toLowerCase()) {
              alert('¡Alguien adivinó la palabra!');
            }
          } else if (type === 'new_round') {
            // clear canvas for new round
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              const canvas = canvasRef.current!;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            if (onNewRound) onNewRound(payload);
          } else if (type === 'player_join') {
            setMessages((prev) => [...prev, `→ ${payload.name} se unió`]);
            if (onPlayerJoin) onPlayerJoin(payload);
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

  const drawRemote = (stroke: { x: number; y: number; }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(stroke.x, stroke.y);
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!isDrawer) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    publish({ x, y });
    const moveHandler = (ev: MouseEvent) => {
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      ctx.lineTo(mx, my);
      ctx.stroke();
      publish({ x: mx, y: my });
    };
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  const publish = async (stroke: { x: number; y: number }) => {
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type: 'stroke', payload: stroke }),
    });
  };

  const sendGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type: 'guess', payload: guess }),
    });
    setGuess('');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isDrawer && secretWord && (
        <p className="text-lg font-mono">Palabra a dibujar: <span className="italic">{secretWord}</span></p>
      )}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border bg-white/10"
        onMouseDown={startDrawing}
      />
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
      <div className="w-full max-w-md h-32 overflow-y-auto bg-white/5 p-2 rounded mt-2">
        {messages.map((msg, i) => (
          <p key={i}>📣 {msg}</p>
        ))}
      </div>
    </div>
  );
}
