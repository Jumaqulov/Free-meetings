const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userName }) => {
        socket.join(roomId);
        socket.userName = userName;
        socket.roomId = roomId;

        // Xonadagi barcha userlar ro‘yxatini qaytarish
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
            (id) => {
                const s = io.sockets.sockets.get(id);
                return { id, userName: s.userName };
            }
        );
        io.to(roomId).emit("all-users", clients);

        // Signal almashish uchun
        socket.on("signal", (data) => {
            io.to(data.to).emit("signal", {
                from: socket.id,
                signal: data.signal,
                userName: socket.userName,
            });
        });

        // Foydalanuvchi chiqsa
        socket.on("disconnect", () => {
            io.to(roomId).emit("user-left", socket.id);
        });
    });
});

server.listen(5000, () => console.log("Signaling server started on 5000"));
