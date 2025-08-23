import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    // If user was in a room, remove them first
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
      socket.leave(currentRoom);
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));
    console.log(`User ${userName} joined room ${roomId}`);
  });

  // Code change listener
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  // Leaving room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
      socket.leave(currentRoom);

      // If room is empty, delete it
      if (rooms.get(currentRoom)?.size === 0) {
        rooms.delete(currentRoom);
      }

      currentRoom = null;
      currentUser = null;
    }
  });

  // Typing event
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  // Language change
  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom) || []));
      if (rooms.get(currentRoom)?.size === 0) {
        rooms.delete(currentRoom);
      }
    }
    console.log("User Disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;
const __dirname = path.resolve();

//app.use(express.static(path.join(__dirname, "/frontend/dist")));

//app.use((req, res) => {
//  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
//});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
