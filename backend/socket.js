import { Server } from "socket.io";
import { DriverProfile } from "./models/DriverProfile.js";

// Track online drivers
const onlineDrivers = new Map(); // Map<driverId, socketId>

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // Driver goes online
        socket.on("driverOnline", async (data) => {
            const { driverId } = data;
            if (driverId) {
                onlineDrivers.set(driverId, socket.id);
                console.log(`✅ Driver ${driverId} is now ONLINE (socket: ${socket.id})`);

                try {
                    await DriverProfile.findOneAndUpdate({ user: driverId }, { isOnline: true });
                    io.to(socket.id).emit("driverStatusUpdated", { isOnline: true });
                } catch (err) {
                    console.error("Error updating driver status to online:", err);
                }
            }
        });

        // Driver goes offline
        socket.on("driverOffline", async (data) => {
            const { driverId } = data;
            if (driverId) {
                onlineDrivers.delete(driverId);
                console.log(`❌ Driver ${driverId} is now OFFLINE`);

                try {
                    await DriverProfile.findOneAndUpdate({ user: driverId }, { isOnline: false });
                    io.to(socket.id).emit("driverStatusUpdated", { isOnline: false });
                } catch (err) {
                    console.error("Error updating driver status to offline:", err);
                }
            }
        });

        socket.on("joinRide", (rideId) => {
            const room = `ride_${rideId}`;
            socket.join(room);
            console.log(`Socket joined ride room: ${room}`);
        });

        socket.on("joinAdmin", () => {
            socket.join("admin_monitoring");
            console.log(`🛡️ Admin joined monitoring room: ${socket.id}`);
        });

        socket.on("driverLocation", async (data) => {
            // data: { driverId, rideId, location: { lat, lng } }
            if (data && data.driverId) {
                // 1. Broadcast to ride-specific room if on a ride
                if (data.rideId) {
                    const room = `ride_${data.rideId}`;
                    io.to(room).emit("driverLocationUpdate", data.location);
                    io.to(room).emit("driverLocation", data.location);
                }

                // 2. Broadcast to global admin room
                // The following lines were likely a checklist or placeholder and are being removed.
                // The original code for broadcasting to admin room is retained as it's functional.
                io.to("admin_monitoring").emit("globalDriverLocation", {
                    driverId: data.driverId,
                    location: data.location
                });

                // 3. Persist to Database for persistence across refreshes
                try {
                    await DriverProfile.findOneAndUpdate(
                        { user: data.driverId },
                        {
                            currentLocation: {
                                ...data.location,
                                lastUpdated: new Date()
                            }
                        }
                    );
                } catch (err) {
                    console.error("Failed to persist driver location:", err);
                }
            }
        });

        socket.on("rideAccepted", (data) => {
            // data: { rideId, driverId }
            if (data && data.rideId) {
                const room = `ride_${data.rideId}`;
                socket.join(room);
                io.to(room).emit("rideStatus", "driver_assigned");
            }
        });

        socket.on("rideCompleted", (data) => {
            // data: { rideId }
            if (data && data.rideId) {
                const room = `ride_${data.rideId}`;
                io.to(room).emit("rideStatus", "completed");
            }
        });

        socket.on("rideStatus", (data) => {
            if (data && data.rideId) {
                const room = `ride_${data.rideId}`;
                io.to(room).emit("rideStatus", data.status);
            }
        });

        socket.on("requestOtp", (data) => {
            if (data && data.rideId) {
                const room = `ride_${data.rideId}`;
                io.to(room).emit("otpRequested", { rideId: data.rideId });
                console.log(`OTP Requested for ride: ${data.rideId}`);
            }
        });

        socket.on("disconnect", async () => {
            console.log("Socket disconnected:", socket.id);
            // Just remove from the in-memory onlineDrivers map
            for (const [driverId, socketId] of onlineDrivers.entries()) {
                if (socketId === socket.id) {
                    onlineDrivers.delete(driverId);
                    console.log(`📡 Driver ${driverId} socket disconnected (Offline in-memory)`);

                    // Update Database for persistence
                    try {
                        await DriverProfile.findOneAndUpdate({ user: driverId }, { isOnline: false });
                    } catch (err) {
                        console.error("Failed to update driver offline status on disconnect:", err);
                    }
                    break;
                }
            }
        });
    });

    // Expose method to get online drivers
    io.getOnlineDrivers = () => Array.from(onlineDrivers.keys());

    return io;
};


