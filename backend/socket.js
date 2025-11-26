// socket.js
let io;
const connectedUsers = new Map(); // Map to store userId -> socketId

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*", // dev only; restrict later if you want
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Handle user joining (authentication)
    socket.on("user:join", (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`); // Join user-specific room
        console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      }
    });

    // Handle private message events
    socket.on("private:message", (data) => {
      const { receiverId, message } = data;
      
      // Emit to receiver's room if they're online
      socket.to(`user:${receiverId}`).emit("private:new-message", {
        message,
        participants: [socket.userId, receiverId]
      });
      
      console.log(`💬 Private message from ${socket.userId} to ${receiverId}`);
    });

    // Handle typing indicators for private messages
    socket.on("private:typing", (data) => {
      const { receiverId, isTyping } = data;
      socket.to(`user:${receiverId}`).emit("private:typing", {
        senderId: socket.userId,
        isTyping
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      
      // Remove user from connected users map
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`👤 User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// Helper function to check if user is online
function isUserOnline(userId) {
  return connectedUsers.has(userId);
}

// Helper function to get connected users
function getConnectedUsers() {
  return Array.from(connectedUsers.keys());
}

module.exports = { initSocket, getIO, isUserOnline, getConnectedUsers };
