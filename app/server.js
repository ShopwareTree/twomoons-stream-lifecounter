const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Store life totals for each room
const rooms = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    // When a player joins a room
    socket.on("join_room", ({ roomId, player }) => {
        socket.join(roomId);

        // Ensure room state exists
        if (!rooms[roomId]) {
            rooms[roomId] = { p1: 20, p2: 20 }; // Default life totals
        }

        // Send updated life totals to all users in the room
        io.to(roomId).emit("initial_life", rooms[roomId]);

        console.log(`${player} joined room ${roomId} - Life totals sent.`);
    });

    // Handle life total updates
    socket.on("update_life", ({ roomId, player, life }) => {
        if (rooms[roomId]) {
            rooms[roomId][player] = life;
        }

        // Broadcast updated life totals to all players in the room
        io.to(roomId).emit("update_life", rooms[roomId]);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});
