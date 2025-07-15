const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, userName }) => {
        if (!roomId || !userName) {
            socket.emit("error", "roomId va userName majburiy");
            return;
        }

        // Xonaga qo‘shilish
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userName = userName;

        console.log(`${userName} room ${roomId} ga qo‘shildi`);

        // Xonadagi barcha foydalanuvchilar ro'yxatini olish
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
            (id) => {
                const s = io.sockets.sockets.get(id);
                return { id, userName: s ? s.userName : "Unknown" };
            }
        );

        // Barcha foydalanuvchilarga yuborish
        io.to(roomId).emit("all-users", clients);

        // **Yangi user haqida boshqa userlarga toast uchun signal yuborish**
        socket.to(roomId).emit("user-joined", userName);

        // Signal almashish uchun event
        socket.on("signal", (data) => {
            if (data.to) {
                io.to(data.to).emit("signal", {
                    from: socket.id,
                    signal: data.signal,
                    userName: socket.userName,
                });
            }
        });

        // Foydalanuvchi xonani tark etsa
        socket.on("disconnect", () => {
            if (socket.roomId) {
                console.log(`${socket.userName} room ${socket.roomId} ni tark etdi`);
                io.to(socket.roomId).emit("user-left", socket.id);
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
