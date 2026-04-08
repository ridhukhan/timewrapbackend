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
dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "https://spaytimes.xyz",
    credentials: true,
  },
});

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

app.use(cors({ origin: "https://spaytimes.xyz", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/post", postRoutes);
httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});