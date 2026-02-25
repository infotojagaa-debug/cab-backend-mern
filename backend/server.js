import path from "path";
import { createServer } from "./index.js";
import { setupSocket } from "./socket.js";
import { Ride } from "./models/Ride.js";
import { DriverProfile } from "./models/DriverProfile.js";
import { connectDB } from "./db.js";
import mongoose from "mongoose";

// Initialize database connection before doing anything else
await connectDB();

const app = createServer();
const port = process.env.PORT || 5000;

// Cancel stale "searching" rides from previous server session.
const cancelStaleRides = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.warn("⚠️ Startup: MongoDB not ready. Skipping cleanup tasks.");
            return;
        }

        // 1. Reset all drivers to offline (incase of previous server crash)
        const driverReset = await DriverProfile.updateMany({}, { $set: { isOnline: false } });
        console.log(`📡 Startup: Reset ${driverReset.modifiedCount} drivers to offline state.`);

        // 2. Cancel stale "searching" rides
        const result = await Ride.updateMany(
            { status: "searching" },
            { $set: { status: "cancelled" } }
        );
        if (result.modifiedCount > 0) {
            console.log(`🧹 Startup: Cancelled ${result.modifiedCount} stale 'searching' ride(s)`);
        }
    } catch (err) {
        console.error("❌ Startup cleanup failed:", err);
    }
};

const server = app.listen(port, async () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔧 API available at http://localhost:${port}/api`);
    await cancelStaleRides();
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
