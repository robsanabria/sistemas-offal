'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { Palette, ArrowLeft, Copy, Check, SkipForward, RotateCcw, Crown, Clock, Eye } from 'lucide-react';
import SketchBoard, { ChatMsg } from '@/components/SketchBoard';

type Player = { id: string; name: string; avatar?: string | null };

const ROUND_SECONDS = 90;
const AVATARS = ['🎨', '😄', '🖌️', '🐱', '🚀', '🦊', '👾', '🐙'];

function PictonaryContent() {
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const [secretWord, setSecretWord] = useState<string | undefined>();
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('🎨');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const leavingRef = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // ── Identidad persistente del cliente ──────────────────────────
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

  // ── Salir de la sala (SOLO en cierre real de pestaña o al tocar "Volver") ──
  const leaveRoom = useCallback(() => {
    if (!roomId || !clientId) return;
    leavingRef.current = true;
    const payload = JSON.stringify({ roomId, playerId: clientId });
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/room/leave', payload);
      } else {
        fetch('/api/room/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch (err) {
      console.error('leaveRoom failed', err);
    }
  }, [roomId, clientId]);

  // ── Unirse a la sala (idempotente: el server solo agrega si no estás) ──
  const ensureJoined = useCallback(async (rId: string) => {
    if (leavingRef.current || !clientId || !playerName) return;
    try {
      await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: rId }) });
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rId, playerId: clientId, name: playerName, avatar: playerAvatar }),
      });
      if (!res.ok) { console.error('join failed', await res.text()); return; }
      const json = await res.json();
      setPlayers(json.meta?.players ?? []);
      setScores(json.meta?.scores ?? {});
      setCurrentDrawerId(json.meta?.drawerId ?? null);
    } catch (err) {
      console.error('ensureJoined error', err);
    }
  }, [clientId, playerName, playerAvatar]);

  // Determinar la sala desde la URL (normalmente 'public') y entrar
  useEffect(() => {
    const existingRoom = searchParams?.get('roomId') ?? 'public';
    if (!clientId || !playerName) return;
    setRoomId(existingRoom);
    ensureJoined(existingRoom);
  }, [searchParams, clientId, playerName, ensureJoined]);

  // ── Poll del estado de la sala (fuente de verdad) ──────────────
  const fetchRoomState = useCallback(async () => {
    if (!roomId || !clientId) return;
    try {
      const res = await fetch(`/api/room/state?roomId=${roomId}&revealTo=${clientId}`);
      if (!res.ok) return;
      const json = await res.json();
      const meta = json.meta ?? {};
      const playerList: Player[] = meta.players ?? [];
      setPlayers(playerList);
      setScores(meta.scores ?? {});
      const drawerId = meta.drawerId ?? null;
      setCurrentDrawerId(drawerId);
      setIsDrawer(drawerId === clientId);
      // El server solo incluye `word` si somos el dibujante (revealTo === drawerId)
      setSecretWord(meta.word ?? undefined);
      // Auto-reincorporación: si quedé fuera de la sala (StrictMode, reinicio
      // del server, limpieza de fantasmas), me re-uno solo.
      if (!leavingRef.current && clientId && !playerList.some((p) => p.id === clientId)) {
        ensureJoined(roomId);
      }
    } catch (err) {
      console.error('Failed fetch room state', err);
    }
  }, [roomId, clientId, ensureJoined]);

  useEffect(() => {
    if (!roomId) return;
    fetchRoomState();
    const iv = setInterval(fetchRoomState, 2000);
    return () => clearInterval(iv);
  }, [roomId, fetchRoomState]);

  // ── Notificar salida al cerrar / desmontar ─────────────────────
  useEffect(() => {
    if (!roomId) return;
    const onUnload = () => leaveRoom();
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    // OJO: NO llamamos leaveRoom en el cleanup de React. Un desmontaje
    // (StrictMode, re-render, navegación SPA) no debe sacarte de la sala;
    // sólo el cierre real de la pestaña o el botón "Volver".
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
    };
  }, [roomId, leaveRoom]);

  // ── Timer de ronda (informativo) ───────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // ── Auto-scroll del chat ───────────────────────────────────────
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const pushMessage = useCallback((msg: ChatMsg) => setMessages((prev) => [...prev.slice(-80), msg]), []);

  const handleNewRound = useCallback(() => {
    setTimeLeft(ROUND_SECONDS);
    fetchRoomState();
  }, [fetchRoomState]);

  const startNextRound = async () => {
    if (!roomId) return;
    try {
      const res = await fetch('/api/room/next', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
      if (!res.ok) { console.error('Failed next round', await res.text()); return; }
      setTimeLeft(ROUND_SECONDS);
      fetchRoomState();
    } catch (err) {
      console.error('startNextRound error', err);
    }
  };

  const resetRoom = async () => {
    if (!roomId) return;
    try {
      const res = await fetch('/api/room/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId }) });
      if (!res.ok) { console.error('Failed reset', await res.text()); return; }
      setMessages([]);
      fetchRoomState();
    } catch (err) {
      console.error('reset room error', err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/pictonary?roomId=${roomId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const drawer = players.find((p) => p.id === currentDrawerId);
  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  // ── Modal de perfil ────────────────────────────────────────────
  const confirmProfile = () => {
    if (!playerName.trim()) return;
    localStorage.setItem('playerName', playerName.trim());
    localStorage.setItem('playerAvatar', playerAvatar);
    setShowProfileModal(false);
  };

  const profileModal = showProfileModal ? (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex items-center gap-2 text-cyan-400 mb-1">
          <Palette size={20} />
          <h3 className="text-xl font-black">Entrá a la sala</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-5">Elegí un nombre y un avatar para jugar.</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && playerName.trim()) confirmProfile(); }}
          placeholder="Tu nombre"
          autoFocus
          className="w-full px-4 py-3 rounded-xl mb-4 bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <div className="mb-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Avatar</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setPlayerAvatar(a)} className={`w-11 h-11 text-xl rounded-xl border transition-all ${playerAvatar === a ? 'bg-cyan-500/20 border-cyan-400/50 scale-110' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{a}</button>
            ))}
          </div>
        </div>
        <button
          onClick={confirmProfile}
          disabled={!playerName.trim()}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-grid text-white p-4 md:p-6">
      {profileModal}
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm" onClick={() => leaveRoom()}>
            <ArrowLeft size={16} /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <Palette size={22} className="text-pink-400" />
            <h1 className="text-2xl font-black tracking-tight">Pictionary</h1>
          </div>
          <button onClick={copyLink} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all">
            {copied ? <><Check size={14} className="text-emerald-400" /> Copiado</> : <><Copy size={14} /> Compartir</>}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ASIDE: jugadores + estado */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            {/* Estado de ronda */}
            <div className="cyber-card !p-4">
              {isDrawer ? (
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-1">Te toca dibujar</p>
                  <p className="text-2xl font-black tracking-tight">{secretWord ?? '…'}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center justify-center gap-1"><Eye size={12} /> Adiviná</p>
                  <p className="text-sm text-zinc-300">Dibuja <span className="font-bold text-pink-400">{drawer?.name ?? '—'}</span></p>
                </div>
              )}
              {timeLeft > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Clock size={13} className="text-zinc-500 shrink-0" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-1000" style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 w-7 text-right">{timeLeft}s</span>
                </div>
              )}
            </div>

            {/* Jugadores */}
            <div className="cyber-card !p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Jugadores ({players.length})</h3>
              <ul className="space-y-1.5">
                {sortedPlayers.map((p) => {
                  const isCurrentDrawer = p.id === currentDrawerId;
                  const isMe = p.id === clientId;
                  return (
                    <li key={p.id} className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${isCurrentDrawer ? 'bg-amber-400/10 border border-amber-400/20' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{p.avatar ?? '🎨'}</span>
                        <span className="truncate text-sm">{p.name}{isMe && <span className="text-zinc-500"> (vos)</span>}</span>
                        {isCurrentDrawer && <Crown size={13} className="text-amber-400 shrink-0" />}
                      </div>
                      <span className="font-mono text-xs text-zinc-400 shrink-0">{scores[p.id] ?? 0}</span>
                    </li>
                  );
                })}
                {players.length === 0 && <li className="text-sm text-zinc-500 py-2">Esperando jugadores…</li>}
              </ul>
            </div>

            {/* Controles */}
            <div className="flex flex-col gap-2">
              <button onClick={startNextRound} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors active:scale-95">
                <SkipForward size={15} /> Siguiente ronda
              </button>
              <button onClick={resetRoom} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 text-zinc-400 text-sm font-bold transition-all active:scale-95">
                <RotateCcw size={15} /> Reiniciar sala
              </button>
            </div>
          </aside>

          {/* MAIN: canvas + chat */}
          <section className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            {roomId && (
              <SketchBoard
                roomId={roomId}
                isDrawer={isDrawer}
                secretWord={secretWord}
                onNewRound={handleNewRound}
                onMessage={pushMessage}
              />
            )}

            {/* Chat unificado */}
            <div className="cyber-card !p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Chat & adivinanzas</h4>
              <div ref={chatRef} className="h-40 overflow-y-auto space-y-1 text-sm pr-1 custom-scrollbar">
                {messages.length === 0 && <p className="text-zinc-600 text-xs italic">Las adivinanzas aparecen acá…</p>}
                {messages.map((m, i) => {
                  if (m.kind === 'correct') return <p key={i} className="text-emerald-400 font-semibold">🏆 {m.name} adivinó: <span className="italic">{m.word}</span></p>;
                  if (m.kind === 'join') return <p key={i} className="text-cyan-400/70 text-xs">→ {m.name} se unió</p>;
                  if (m.kind === 'leave') return <p key={i} className="text-zinc-500 text-xs">← {m.name} se fue</p>;
                  if (m.kind === 'system') return <p key={i} className="text-amber-400/70 text-xs italic">{m.text}</p>;
                  return <p key={i} className="text-zinc-300"><span className="font-bold text-zinc-100">{m.name ?? 'Alguien'}:</span> {m.text}</p>;
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function PictonaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grid flex items-center justify-center text-white">Cargando sala…</div>}>
      <PictonaryContent />
    </Suspense>
  );
}
