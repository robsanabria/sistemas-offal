import { useEffect, useRef, useState } from 'react';
import { Redis } from '@upstash/redis';

interface SketchBoardProps {
  roomId: string;
  isDrawer: boolean;
  secretWord?: string;
}

export default function SketchBoard({ roomId, isDrawer, secretWord }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const redisRef = useRef<Redis | null>(null);

  // Subscribe to channel for receiving strokes and guesses
  useEffect(() => {
    const redis = new Redis({
      url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
      token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
    });
    redisRef.current = redis;
    const channel = `pictonary:${roomId}`;
    const unsubscribe = (redis as any).subscribe(channel, (msg: string) => {
      const { type, payload } = JSON.parse(msg as string);
      if (type === 'stroke') {
        drawRemote(payload);
      } else if (type === 'guess') {
        setMessages((prev) => [...prev, payload]);
        if (payload.toLowerCase() === (secretWord ?? '').toLowerCase()) {
          alert('¡Alguien adivinó la palabra!');
        }
      }
    });
    return () => {
      unsubscribe();
    };
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
