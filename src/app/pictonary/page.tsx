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
  const clientIdRef = useRef<string>('');

  // ID persistente del cliente
  useEffect(() => {
    let cid = localStorage.getItem('clientId');
    if (!cid) {
      cid = crypto.randomUUID();
      localStorage.setItem('clientId', cid);
    }
    clientIdRef.current = cid;
  }, []);

  // Crear o unirse a sala
  useEffect(() => {
    const existingRoom = searchParams?.get('roomId');
    if (existingRoom) {
      setRoomId(existingRoom);
      const drawerId = localStorage.getItem(`drawer:${existingRoom}`);
      const storedWord = localStorage.getItem(`word:${existingRoom}`);
      if (drawerId && drawerId === clientIdRef.current) {
        setIsDrawer(true);
        setSecretWord(storedWord ?? undefined);
      }
    } else {
      fetch('/api/room', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          setRoomId(data.roomId);
          localStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
          localStorage.setItem(`word:${data.roomId}`, data.word);
          if (data.drawerId === clientIdRef.current) {
            setIsDrawer(true);
            setSecretWord(data.word);
          }
          router.replace(`/pictonary?roomId=${data.roomId}`);
        })
        .catch((err) => console.error('Error al crear sala', err));
    }
  }, [searchParams, router]);

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
      </div>

      <SketchBoard roomId={roomId} isDrawer={isDrawer} secretWord={secretWord} />
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
