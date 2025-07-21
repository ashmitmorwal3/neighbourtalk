import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { alertRouter } from "./routes/alerts";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/neighbor-alert";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_join", (data) => {
    if (data.userId) {
      socket.join(data.userId);
      console.log(`User ${data.userId} joined their room`);
    }
  });

  socket.on("update_location", (data) => {
    if (data.userId) {
      io.to(data.userId).emit("location_updated", data.location);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/alerts", alertRouter);

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  // Only listen directly in development
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless deployment
export default app;
