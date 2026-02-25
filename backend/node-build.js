import path from "path";
import { createServer } from "./index";
import * as express from "express";
import { connectDB } from "./db";
import { Ride } from "./models/Ride.js";

const app = createServer();
const port = process.env.PORT || 3000;

// Cancel stale "searching" rides from previous server session.
// After a restart, no drivers are online to receive them — leaving them in DB
// causes the frontend to try accepting them, which always fails with 400.
const cancelStaleRides = async () => {
  try {
    const result = await Ride.updateMany(
      { status: "searching" },
      { $set: { status: "cancelled" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🧹 Startup: Cancelled ${result.modifiedCount} stale 'searching' ride(s) from previous session`);
    }
  } catch (err) {
    console.error("❌ Startup cleanup failed:", err);
  }
};

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

import { setupSocket } from "./socket";

const server = app.listen(port, async () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: https://cab-backend-mern.onrender.com`);
  console.log(`🔧 API: https://cab-backend-mern.onrender.com/api`);
  await cancelStaleRides(); // Cancel stale rides after DB connection is ready
});

const io = setupSocket(server);
app.set("io", io);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
