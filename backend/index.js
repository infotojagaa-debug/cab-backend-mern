import 'dotenv/config';
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { register, login, sendOtp, verifyOtp, getMe } from "./routes/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { rideRoutes } from "./routes/rides.js";
import { driverRoutes } from "./routes/driver.js";
import { adminRoutes } from "./routes/admin.js";
import { notificationRoutes } from "./routes/notifications.js";
import geocodingRoutes from "./routes/geocoding.js";

import { connectDB } from "./db.js";

export function createServer() {
  const app = express();

  // Track DB connection status
  mongoose.connection.on('connected', () => app.set('db_connected', true));
  mongoose.connection.on('disconnected', () => app.set('db_connected', false));
  app.set('db_connected', mongoose.connection.readyState === 1);

  // Middleware
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health checks
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "pong" });
  });

  app.get("/api/health", (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.json({
      status: dbState === 1 ? "healthy" : "error",
      database: states[dbState] || "unknown",
      time: new Date().toISOString()
    });
  });

  app.get("/api/demo", handleDemo);

  // Authentication API routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", verifyToken, getMe);
  app.post("/api/auth/send-otp", sendOtp);
  app.post("/api/auth/verify-otp", verifyOtp);

  // Feature API routes
  app.use("/api/geocoding", geocodingRoutes);
  app.use("/api/rides", rideRoutes);
  app.use("/api/driver", driverRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  // Catch-all 404 for any unhandled /api requests to prevent Vite HTML fallback

  app.get("/", (req, res) => {
    res.send("Cab backend api is running")
  });
  
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Method to attach Socket.IO instance
  app.setSocketIO = (io) => {
    app.set('io', io);
  };

  

  return app;
}
