'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import SketchBoard from '@/components/SketchBoard';

function PictonaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const [secretWord, setSecretWord] = useState<string | undefined>();
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const ROUND_SECONDS = 60;
  const [messages, setMessages] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const joinedRef = useRef(false);

  // ID persistente del cliente
  useEffect(() => {
    let cid = localStorage.getItem('clientId');
    if (!cid) {
      cid = crypto.randomUUID();
      localStorage.setItem('clientId', cid);
    }
    setClientId(cid);
  }, []);

  // Crear o unirse a sala
  useEffect(() => {
    const existingRoom = searchParams?.get('roomId');
    if (!clientId) return; // wait until clientId is available
    const ensureJoin = async (rId: string) => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      const playerId = clientId;
      const name = `Player-${playerId.slice(0,6)}`;
      try {
        const res = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: rId, playerId, name }),
        });
        if (!res.ok) {
          console.error('Failed to join room', await res.text());
          return;
        }
        const json = await res.json();
        setPlayers(json.meta.players ?? []);
        setScores(json.meta.scores ?? {});
      } catch (err) {
        console.error('Error joining room', err);
      }
    };

    if (existingRoom) {
      setRoomId(existingRoom);
      // try to rehydrate drawer/word from localStorage
      const drawerId = localStorage.getItem(`drawer:${existingRoom}`);
      const storedWord = localStorage.getItem(`word:${existingRoom}`);
      if (drawerId && drawerId === clientId) {
        setIsDrawer(true);
        setSecretWord(storedWord ?? undefined);
      }
      ensureJoin(existingRoom);
    } else {
      (async () => {
        try {
          const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: clientId, name: `Player-${clientId.slice(0,6)}` }) });
          if (!res.ok) {
            const text = await res.text();
            console.error('API /api/room returned non-ok:', res.status, text);
            return;
          }
          const data = await res.json();
          setRoomId(data.roomId);
          localStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
          localStorage.setItem(`word:${data.roomId}`, data.word);
          if (data.drawerId === clientId) {
            setIsDrawer(true);
            setSecretWord(data.word);
          }
          router.replace(`/pictonary?roomId=${data.roomId}`);
          ensureJoin(data.roomId);
        } catch (err) {
          console.error('Error al crear sala (fetch failed):', err);
        }
      })();
    }
  }, [searchParams, router, clientId]);


  // Poll room state periodically
  useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    const fetchState = async () => {
      try {
        const revealTo = clientId;
        const res = await fetch(`/api/room/state?roomId=${roomId}&revealTo=${revealTo}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const meta = json.meta ?? {};
        setPlayers(meta.players ?? []);
        setScores(meta.scores ?? {});
        const drawerId = meta.drawerId;
        setIsDrawer(drawerId === clientId);
        if (meta.word && drawerId === clientId) setSecretWord(meta.word);
      } catch (err) {
        console.error('Failed fetch room state', err);
      }
    };
    fetchState();
    const iv = setInterval(fetchState, 2000);
    return () => { mounted = false; clearInterval(iv); };
  }, [roomId]);

  // handle events from SketchBoard
  const handleNewRound = (payload: any) => {
    // start round timer
    setTimeLeft(ROUND_SECONDS);
  };

  const handlePlayerJoin = (payload: any) => {
    setMessages((prev) => [...prev, `→ ${payload.name} se unió`]);
  };

  const handleGuess = (payload: string) => {
    setMessages((prev) => [...prev, payload]);
  };

  // timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const startNextRound = async () => {
    if (!roomId) return;
    try {
      const res = await fetch('/api/room/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      if (!res.ok) {
        console.error('Failed to start next round', await res.text());
        return;
      }
      const json = await res.json();
      // if we are the drawer, server returns the word
      if (json.word && json.drawerId === clientId) {
        setSecretWord(json.word);
        localStorage.setItem(`word:${roomId}`, json.word);
        setIsDrawer(true);
      } else {
        setSecretWord(undefined);
        setIsDrawer(false);
      }
      // start timer locally as well
      setTimeLeft(ROUND_SECONDS);
    } catch (err) {
      console.error('startNextRound error', err);
    }
  };

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Cargando sala...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">🎨 Pictonary</h1>

      {/* Link para compartir */}
      <div className="text-center mb-4">
        <p className="text-sm text-white/50">Compartí este link para que adivinen:</p>
        <code className="text-xs bg-white/10 px-3 py-1 rounded select-all">
          {typeof window !== 'undefined'
            ? `${window.location.origin}/pictonary?roomId=${roomId}`
            : ''}
        </code>
        <div className="mt-2">
          <button
            onClick={async () => {
              if (!clientId) return;
              const name = `Player-${clientId.slice(0,6)}`;
              try {
                const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: clientId, name }) });
                if (!res.ok) {
                  console.error('Failed to create room', await res.text());
                  return;
                }
                const data = await res.json();
                setRoomId(data.roomId);
                localStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
                localStorage.setItem(`word:${data.roomId}`, data.word);
                if (data.drawerId === clientId) {
                  setIsDrawer(true);
                  setSecretWord(data.word);
                }
                router.replace(`/pictonary?roomId=${data.roomId}`);
                // ensure we're joined (server already adds player on create, but call join to refresh client state)
                await fetch('/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: data.roomId, playerId: clientId, name }) });
              } catch (err) {
                console.error('Error creating room', err);
              }
            }}
            className="mt-2 px-3 py-2 bg-emerald-500 rounded text-sm hover:bg-emerald-400"
          >
            Crear sala / Ser dibujante
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 bg-white/5 p-4 rounded">
          <h3 className="font-bold mb-2">Jugadores</h3>
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}</span>
                <span className="font-mono text-sm">{scores[p.id] ?? 0} pts</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="mb-2">Tiempo: <span className="font-mono">{timeLeft}s</span></div>
            {isDrawer ? (
              <button onClick={startNextRound} className="px-3 py-2 bg-cyan-600 rounded">Iniciar Siguiente Ronda</button>
            ) : (
              <div className="text-sm text-zinc-400">Esperando al dibujante...</div>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <SketchBoard
            roomId={roomId}
            isDrawer={isDrawer}
            secretWord={secretWord}
            onNewRound={handleNewRound}
            onPlayerJoin={handlePlayerJoin}
            onGuess={handleGuess}
          />

          <div className="mt-4 bg-white/5 p-3 rounded max-w-2xl">
            <h4 className="font-bold mb-2">Chat / Adivinanzas</h4>
            <div className="h-40 overflow-y-auto space-y-1 text-sm">
              {messages.map((m, i) => (
                <div key={i}>📣 {m}</div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PictonaryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-white bg-gradient-to-b from-indigo-900 to-purple-900">
          Cargando...
        </div>
      }
    >
      <PictonaryContent />
    </Suspense>
  );
}
