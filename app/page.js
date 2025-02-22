"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${newRoomId}?bg=ffffff&size=200px&fontcolor=black`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold">MTG Life Counter</h1>
      <div className="flex flex-col gap-4 mt-4">
        <Button onClick={createRoom}>Create New Room</Button>
        <input 
          type="text" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)} 
          placeholder="Enter Room ID"
          className="border p-2 rounded-md"
        />
        <Button onClick={joinRoom}>Join Room</Button>
      </div>
    </div>
  );
}

export function GameRoom() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomId = pathname.split("/").pop();
  const player = searchParams.get("player");

  const [life, setLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", { roomId, player });

    socket.on("update_life", ({ player: updatedPlayer, life: updatedLife }) => {
      if (updatedPlayer !== player) {
        setOpponentLife(updatedLife);
      }
    });

    return () => {
      socket.off("update_life");
    };
  }, [roomId, player]);

  const changeLife = (amount) => {
    const newLife = life + amount;
    setLife(newLife);
    socket.emit("update_life", { roomId, player, life: newLife });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold">MTG Life Counter</h1>
      <p className="text-lg">Room ID: {roomId}</p>
      <Card className="w-80 my-4 p-4">
        <CardContent className="flex flex-col items-center">
          <h2 className="text-xl font-semibold">Your Life: {life}</h2>
          <div className="flex gap-4 mt-2">
            <Button onClick={() => changeLife(1)}>+1</Button>
            <Button onClick={() => changeLife(-1)}>-1</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="w-80 my-4 p-4">
        <CardContent className="flex flex-col items-center">
          <h2 className="text-xl font-semibold">Opponent Life: {opponentLife}</h2>
        </CardContent>
      </Card>
    </div>
  );
}
