"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import SketchBoard from '@/components/SketchBoard';
import { v4 as uuidv4 } from 'uuid';

export default function PictonaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const [secretWord, setSecretWord] = useState<string | undefined>();

  // Persistent client identifier
  const clientIdRef = useRef<string>('');
  useEffect(() => {
    let cid = localStorage.getItem('clientId');
    if (!cid) {
      cid = uuidv4();
      localStorage.setItem('clientId', cid);
    }
    clientIdRef.current = cid;
  }, []);

  // Initialise room (create or join)
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
      // Create a new room
      fetch('/api/room', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          setRoomId(data.roomId);
          // store drawer information for this client
          localStorage.setItem(`drawer:${data.roomId}`, data.drawerId);
          localStorage.setItem(`word:${data.roomId}`, data.word);
          // if this client is the drawer (we just created it)
          if (data.drawerId === clientIdRef.current) {
            setIsDrawer(true);
            setSecretWord(data.word);
          }
          router.replace(`/pictonary?roomId=${data.roomId}`);
        })
        .catch((err) => console.error('Failed to create room', err));
    }
  }, [searchParams]);

  if (!roomId) {
    return <div className="flex items-center justify-center h-screen text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Pictonary</h1>
      <SketchBoard roomId={roomId} isDrawer={isDrawer} secretWord={secretWord} />
    </div>
  );
}
