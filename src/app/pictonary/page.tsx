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
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const ROUND_SECONDS = 60;
  const [messages, setMessages] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('🎨');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const joinedRef = useRef(false);

  // Call server to leave room (use sendBeacon for unload safety, fallback to fetch keepalive)
  const leaveRoom = () => {
    if (!roomId || !clientId || !joinedRef.current) return;
    const payload = JSON.stringify({ roomId, playerId: clientId });
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).sendBeacon) {
        // sendBeacon expects a URL and body (string/Blob)
        (navigator as any).sendBeacon('/api/room/leave', payload);
      } else {
        // try a keepalive fetch (may be ignored on some browsers during unload)
        fetch('/api/room/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch (err) {
      // best-effort, do not block unload
      console.error('leaveRoom failed', err);
    }
  };

  // ID persistente del cliente
  useEffect(() => {
    let cid = localStorage.getItem('clientId');
    if (!cid) {
      cid = crypto.randomUUID();
      localStorage.setItem('clientId', cid);
    }
    setClientId(cid);
    const storedName = localStorage.getItem('playerName');
    const storedAvatar = localStorage.getItem('playerAvatar');
    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    if (!storedName) setShowProfileModal(true);
  }, []);

  // Crear o unirse a sala
  useEffect(() => {
    const existingRoom = searchParams?.get('roomId');
    if (!clientId) return; // wait until clientId is available
                    <div className="mt-3">
                      <button onClick={async () => {
                        if (!roomId) return;
                        try {
                          const res = await fetch('/api/room/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
                          if (!res.ok) { console.error('Failed to reset room', await res.text()); return; }
                          await fetchRoomState();
                        } catch (err) { console.error('reset room error', err); }
                      }} className="w-full px-3 py-2 bg-rose-600 rounded">Reiniciar Sala</button>
                    </div>
    if (!playerName) return; // wait until player provides a name

    const ensureJoin = async (rId: string) => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      const playerId = clientId;
      const name = playerName || `Player-${playerId.slice(0,6)}`;
      try {
        const res = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: rId, playerId, name, avatar: playerAvatar }),
        });
        if (!res.ok) {
          console.error('Failed to join room', await res.text());
          return;
        }
        const json = await res.json();
        setPlayers(json.meta.players ?? []);
        setScores(json.meta.scores ?? {});
        setCurrentDrawerId(json.meta.drawerId ?? null);
        // if this player is the drawer, persist per-tab drawer marker so UI stays consistent
        if (json.meta.drawerId === playerId) {
          try {
            sessionStorage.setItem(`drawer:${rId}`, json.meta.drawerId);
            if (json.meta.word) sessionStorage.setItem(`word:${rId}`, json.meta.word);
          } catch {}
          setIsDrawer(true);
          setSecretWord(json.meta.word ?? undefined);
        }
      } catch (err) {
        console.error('Error joining room', err);
      }
    };

    if (existingRoom) {
      setRoomId(existingRoom);
      // try to rehydrate drawer/word from sessionStorage (per-tab)
      const drawerId = sessionStorage.getItem(`drawer:${existingRoom}`);
      const storedWord = sessionStorage.getItem(`word:${existingRoom}`);
      if (drawerId && drawerId === clientId) {
        setIsDrawer(true);
        setSecretWord(storedWord ?? undefined);
        setCurrentDrawerId(drawerId);
      }
      ensureJoin(existingRoom);
    } else {
      (async () => {
        try {
          const name = playerName || `Player-${clientId.slice(0,6)}`;
          if (!playerName) {
            // ask user to pick a name before creating
            setShowProfileModal(true);
            return;
          }
          const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: clientId, name, avatar: playerAvatar }) });
          if (!res.ok) {
            const text = await res.text();
            console.error('API /api/room returned non-ok:', res.status, text);
            return;
          }
          const data = await res.json();
          setRoomId(data.roomId);
          // store drawer info per-tab so other tabs don't incorrectly show the secret word
          sessionStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
          sessionStorage.setItem(`word:${data.roomId}`, data.word);
          setCurrentDrawerId(data.drawerId);
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
  }, [searchParams, router, clientId, playerName, playerAvatar]);

  // Poll room state helper
  const fetchRoomState = async () => {
    if (!roomId) return;
    try {
      const revealTo = clientId;
      const res = await fetch(`/api/room/state?roomId=${roomId}&revealTo=${revealTo}`);
      if (!res.ok) return;
      const json = await res.json();
      const meta = json.meta ?? {};
      setPlayers(meta.players ?? []);
      setScores(meta.scores ?? {});
      const drawerId = meta.drawerId;
      setCurrentDrawerId(drawerId ?? null);
      setIsDrawer(drawerId === clientId);
      // Only show the secret word if this tab is the session owner of the drawer role.
      const isSessionDrawer = sessionStorage.getItem(`drawer:${roomId}`) === clientId;
      if (meta.word && drawerId === clientId && isSessionDrawer) {
        setSecretWord(meta.word);
      } else {
        setSecretWord(undefined);
        // if server says someone else is drawer, clear per-tab drawer markers
        if (drawerId !== clientId) {
          sessionStorage.removeItem(`drawer:${roomId}`);
          sessionStorage.removeItem(`word:${roomId}`);
        }
      }
    } catch (err) {
      console.error('Failed fetch room state', err);
    }
  };


  useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    fetchRoomState();
    const iv = setInterval(fetchRoomState, 2000);
    return () => { mounted = false; clearInterval(iv); };
  }, [roomId, clientId]);

  // Profile modal shown even before entering/creating a room
  const ProfileModal = showProfileModal ? (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white/5 p-6 rounded max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Elegí un nickname</h3>
        <p className="text-sm text-white/70 mb-4">Este nombre se usará en la sala.</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full px-3 py-2 rounded mb-3 bg-white/10"
        />
        <div className="mb-3">
          <div className="text-sm mb-1">Elige un avatar (emoji)</div>
          <div className="flex gap-2">
            {['🎨','😄','🖌️','🐱','🚀'].map((a) => (
              <button key={a} onClick={() => setPlayerAvatar(a)} className={`p-2 rounded ${playerAvatar===a? 'bg-emerald-600':''}`}>{a}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => { if (playerName.trim()) { localStorage.setItem('playerName', playerName); localStorage.setItem('playerAvatar', playerAvatar); setShowProfileModal(false); } }} className="px-3 py-2 bg-emerald-500 rounded">Continuar</button>
        </div>
      </div>
    </div>
  ) : null;

  // handle events from SketchBoard
  const handleNewRound = (payload: any) => {
    // start round timer and refresh room state immediately
    setTimeLeft(ROUND_SECONDS);
    fetchRoomState();
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

  // Notify server when the user closes the tab or navigates away
  useEffect(() => {
    if (!roomId) return;
    const onUnload = () => {
      leaveRoom();
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    return () => {
      // best-effort leave on component unmount
      try { leaveRoom(); } catch {}
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
    };
  }, [roomId, clientId]);

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
        // mark this tab as the session drawer and store the secret word per-tab
        sessionStorage.setItem(`drawer:${roomId}`, json.drawerId);
        sessionStorage.setItem(`word:${roomId}`, json.word);
        setIsDrawer(true);
        setCurrentDrawerId(json.drawerId ?? null);
      } else {
        setSecretWord(undefined);
        setIsDrawer(false);
        setCurrentDrawerId(json.drawerId ?? null);
      }
      // start timer locally as well
      setTimeLeft(ROUND_SECONDS);
    } catch (err) {
      console.error('startNextRound error', err);
    }
  };

  if (!roomId) {
    return (
      <>
        {ProfileModal}
        <div className="flex items-center justify-center h-screen text-white">
          Cargando sala...
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-4 text-white">
      {ProfileModal}
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
                const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: clientId, name, avatar: playerAvatar }) });
                if (!res.ok) {
                  console.error('Failed to create room', await res.text());
                  return;
                }
                const data = await res.json();
                setRoomId(data.roomId);
                sessionStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
                sessionStorage.setItem(`word:${data.roomId}`, data.word);
                if (data.drawerId === clientId) {
                  setIsDrawer(true);
                  setSecretWord(data.word);
                }
                router.replace(`/pictonary?roomId=${data.roomId}`);
                // ensure we're joined (server already adds player on create, but call join to refresh client state)
                await fetch('/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: data.roomId, playerId: clientId, name }) });
                  await fetch('/api/room/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: data.roomId, playerId: clientId, name, avatar: playerAvatar }) });
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
            {players.map((p) => {
              const isCurrentDrawer = currentDrawerId && p.id === currentDrawerId;
              return (
                <li key={p.id} className={`flex items-center justify-between px-2 py-1 rounded ${isCurrentDrawer ? 'bg-white/6' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.avatar ?? '🎨'}</span>
                    <span>{p.name}</span>
                    {isCurrentDrawer && (
                      <span className="text-xs bg-amber-500 text-amber-900 px-2 py-0.5 rounded-full font-semibold">Dibujante</span>
                    )}
                  </div>
                  <span className="font-mono text-sm">{scores[p.id] ?? 0} pts</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <div className="mb-2">Dibujante: <span className="font-semibold">{players.find((p) => p.id === currentDrawerId)?.name ?? '—'}</span></div>
            <div className="mb-2">Tiempo: <span className="font-mono">{timeLeft}s</span></div>
            {(() => {
              // keep button visible if this tab holds the drawer session marker or isDrawer
              const isSessionDrawer = typeof window !== 'undefined' && roomId ? sessionStorage.getItem(`drawer:${roomId}`) === clientId : false;
              const showReset = isDrawer || isSessionDrawer;
              if (showReset) {
                return (
                  <div className="flex gap-2">
                    <button onClick={startNextRound} className="px-3 py-2 bg-cyan-600 rounded">Iniciar Siguiente Ronda</button>
                    <button onClick={async () => {
                      if (!roomId) return;
                      try {
                        const res = await fetch('/api/room/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
                        if (!res.ok) { console.error('Failed to reset room', await res.text()); return; }
                        await fetchRoomState();
                      } catch (err) { console.error('reset room error', err); }
                    }} className="px-3 py-2 bg-rose-600 rounded">Reiniciar Sala</button>
                  </div>
                );
              }
              return (
              (() => {
                const drawerPresent = players.find((p) => p.id === currentDrawerId);
                if (!drawerPresent) {
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-zinc-400">No se encuentra el dibujante — cualquiera puede iniciar la ronda.</div>
                      <div className="flex gap-2">
                        <button onClick={startNextRound} className="px-3 py-2 bg-cyan-600 rounded">Iniciar Siguiente Ronda</button>
                        <button onClick={async () => {
                          if (!roomId) return;
                          try {
                            const res = await fetch('/api/room/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
                            if (!res.ok) { console.error('Failed to reset room', await res.text()); return; }
                            await fetchRoomState();
                          } catch (err) { console.error('reset room error', err); }
                        }} className="px-3 py-2 bg-rose-600 rounded">Reiniciar Sala</button>
                      </div>
                    </div>
                  );
                }
                return <div className="text-sm text-zinc-400">Esperando al dibujante...</div>;
              })()
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
