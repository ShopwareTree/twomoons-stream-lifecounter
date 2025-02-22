"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

export default function GameRoom() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomId = pathname.split("/").pop();
  const player = searchParams.get("player");
  const isOverview = !player;
  let backgroundColor = searchParams.get("bg") || "white";
  let fontColor = searchParams.get("fontcolor") || "white";
  const fontSize = searchParams.get("size") || "9xl";

  useEffect(() => {
  // Ensure it starts with "#" (if it’s a valid hex code)
  if (!backgroundColor.startsWith("#") && /^[0-9A-F]{6}$/i.test(backgroundColor)) {
    backgroundColor = `#${backgroundColor}`;
  }
  document.body.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = "transparent";
    };
  }, [backgroundColor]);

  const [p1Life, setP1Life] = useState(null);
  const [p2Life, setP2Life] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", { roomId, player });

    socket.on("initial_life", ({ p1, p2 }) => {
      setP1Life(p1);
      setP2Life(p2);
    });

    socket.on("update_life", ({ p1, p2 }) => {
      setP1Life(p1);
      setP2Life(p2);
    });

    return () => {
      socket.off("initial_life");
      socket.off("update_life");
    };
  }, [roomId, player]);

  const changeLife = (player, amount) => {
    if (p1Life === null || p2Life === null) return;

    const newLife = player === "p1" ? p1Life + amount : p2Life + amount;
    if (player === "p1") {
      setP1Life(newLife);
    } else {
      setP2Life(newLife);
    }
    socket.emit("update_life", { roomId, player, life: newLife });
  };

  if (p1Life === null || p2Life === null) {
    return <div className="flex justify-center items-center h-screen text-black">Loading room state...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-black">
      {isOverview ? (
        <>
          <h1 className="text-3xl font-bold mb-4">MTG Life Counter</h1>
          <p className="text-lg mb-4">Room ID: {roomId}</p>
          <div className="flex flex-col w-full h-full">
            <div className="flex flex-1 items-center justify-between p-8 border-b border-gray-300">
              <Button onClick={() => changeLife("p1", -1)}>-1</Button>
              <h2 className="text-6xl font-bold">{p1Life}</h2>
              <Button onClick={() => changeLife("p1", 1)}>+1</Button>
            </div>
            <div className="flex flex-1 items-center justify-between p-8">
              <Button onClick={() => changeLife("p2", -1)}>-1</Button>
              <h2 className="text-6xl font-bold">{p2Life}</h2>
              <Button onClick={() => changeLife("p2", 1)}>+1</Button>
            </div>
          </div>
          <div className="mt-6">
            <Link href={`/room/${roomId}?player=p1&bg=ffffff&size=200px&fontcolor=black`} className="text-blue-600 underline">Join as Player 1</Link>
            <br />
            <Link href={`/room/${roomId}?player=p2&bg=ffffff&size=200px&fontcolor=black`} className="text-blue-600 underline">Join as Player 2</Link>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h1 className={`font-bold`} style={{ fontSize: fontSize, color: fontColor }}>{player === "p1" ? p1Life : p2Life}</h1>
        </div>
      )}
    </div>
  );
}
