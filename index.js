import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import postRoutes from "./Routes/postRoutes.js";

import followRoutes from "./Routes/followRoutes.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Online users track করবো
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  }

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.use(cors({ 
  origin: [
    "https://spaytimes.xyz",      // আপনার মেইন ওয়েবসাইট
    "capacitor://localhost",      // অ্যান্ড্রয়েড অ্যাপের জন্য (খুবই জরুরি)
    "http://localhost"            // লোকাল ডেভেলপমেন্টের জন্য
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/post", postRoutes);
app.use("/follow", followRoutes);
httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});