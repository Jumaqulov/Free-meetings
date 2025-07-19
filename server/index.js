const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socket => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, userName }) => {
        if (!roomId || !userName) {
            return socket.emit("error", "roomId va userName majburiy");
        }

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.userName = userName;
        console.log(`👤 ${userName} joined room ${roomId}`);

        // xonadagi boshqa userlar
        const existing = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            .filter(id => id !== socket.id)
            .map(id => {
                const s = io.sockets.sockets.get(id);
                return { id, userName: s?.data?.userName || "Unknown" };
            });

        // 1) Yangi userga faqat existing jo'nataymiz
        socket.emit("init-users", existing);

        // 2) Boshqalarga yangi userni bildiramiz
        socket.to(roomId).emit("user-joined", { id: socket.id, userName });
    });

    socket.on("signal", ({ to, signal }) => {
        if (to && signal) {
            io.to(to).emit("signal", {
                from: socket.id,
                signal,
                userName: socket.data.userName
            });
        }
    });

    socket.on("disconnect", reason => {
        const { roomId, userName } = socket.data;
        if (roomId) {
            console.log(`❌ ${userName} left room ${roomId}`);
            io.to(roomId).emit("user-left", socket.id);
        }
    });
});

server.listen(5000, () => {
    console.log("🚀 Signaling server running on port 5000");
});
