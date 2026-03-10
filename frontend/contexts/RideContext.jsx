import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useApp } from "./AppContext";
import io from "socket.io-client";
import { getApiUrl, getSocketUrl } from "../utils/api";

const RideContext = createContext(undefined);

export const RideProvider = ({ children }) => {
    const { user } = useApp();
    const [activeRide, setActiveRide] = useState(null);
    const [newRequest, setNewRequest] = useState(null);
    const [timer, setTimer] = useState(30);
    const socketRef = useRef(null);

    useEffect(() => {
        const socketUrl = getSocketUrl();

        if (!socketRef.current) {
            socketRef.current = io(socketUrl, {
                transports: ["websocket"], // Hard-coded websocket for stability if possible
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                timeout: 10000
            });
        }

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("RideContext: Socket connected", socket.id);
            if (user?.role === "driver" && activeRide?._id) {
                socket.emit("joinRide", activeRide._id);
            }
        });

        // Fetch active ride on mount
        const fetchActiveRide = async () => {
            if (user?.id) {
                try {
                    const token = sessionStorage.getItem("authToken");
                    // Drivers use /driver/active, customers use /active
                    const endpoint = user.role === "driver" ? "/api/rides/driver/active" : "/api/rides/active";
                    const res = await fetch(getApiUrl(endpoint), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const ride = await res.json();
                        if (ride) {
                            setActiveRide(ride);
                            socket.emit("joinRide", ride._id);
                            console.log(`RideContext: Reconnected to active ride ${ride._id}`);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching active ride", err);
                }
            }
        };
        fetchActiveRide();

        socket.on("newRideRequest", (rideData) => {
            console.log("RideContext: New ride request received:", {
                id: rideData.rideId,
                customer: rideData.customer?.name,
                fare: rideData.fare
            });
            setNewRequest(rideData);
            setTimer(30);
        });

        socket.on("rideAccepted", (rideData) => {
            console.log("RideContext: Ride accepted by driver:", rideData);
            setActiveRide(rideData);
            setNewRequest(null);
        });

        socket.on("rideCancelledGlobal", (data) => {
            console.log("RideContext: Global ride cancellation:", data);
            setNewRequest(prev => (prev?.rideId === data.rideId ? null : prev));
        });

        socket.on("tripCompleted", (data) => {
            console.log("RideContext: Trip completed:", data);
            setActiveRide(null);
        });

        socket.on("driverLocationUpdate", (location) => {
            // Drivers should not update their own activeRide state from socket events
            // as it causes circular updates and performance lag.
            if (user?.role === "driver") return;

            console.log("RideContext: Driver location update:", location);
            if (activeRide) {
                setActiveRide(prev => ({ ...prev, driverLocation: location }));
            }
        });

        return () => {
            socket.off("connect");
            socket.off("newRideRequest");
            socket.off("rideStatusUpdate");
            socket.off("rideAccepted");
            socket.off("rideCancelledGlobal");
            socket.off("tripCompleted");
            socket.off("driverLocationUpdate");
        };
    }, [user?.id]);

    useEffect(() => {
        let t;
        if (newRequest && timer > 0) {
            t = setInterval(() => setTimer(v => v - 1), 1000);
        } else if (timer === 0) {
            setNewRequest(null);
        }
        return () => clearInterval(t);
    }, [newRequest, timer]);

    const acceptRide = async (rideId) => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl(`/api/rides/${rideId}/status`), {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "driver_assigned" })
            });

            if (res.ok) {
                const updatedRide = await res.json();
                setActiveRide(updatedRide);
                setNewRequest(null);
                socketRef.current.emit("rideAccepted", { rideId, driverId: user.id });
                return true;
            }

            // Handle error response
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error || "Failed to accept ride";
            console.error(`acceptRide: ${res.status} - ${msg}`);

            // If the ride is no longer available (taken, cancelled, etc.), dismiss the modal
            if (res.status === 400 || res.status === 409) {
                setNewRequest(null); // dismiss the stale request card
            }
            return false;
        } catch (err) {
            console.error("Error accepting ride", err);
            return false;
        }
    };

    const updateStatus = async (rideId, status, data = {}) => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl(`/api/rides/${rideId}/status`), {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, ...data })
            });

            const resultData = await res.json().catch(() => ({}));

            if (res.ok) {
                setActiveRide(resultData);
                if (status === "completed") {
                    socketRef.current.emit("rideCompleted", { rideId });
                    setActiveRide(null);
                }
                return { success: true };
            } else {
                return { success: false, error: resultData.error || "Update failed" };
            }
        } catch (err) {
            console.error("Error updating status", err);
            return { success: false, error: err.message || "Network error" };
        }
    };


    return (
        <RideContext.Provider
            value={{
                activeRide,
                setActiveRide,
                newRequest,
                setNewRequest,
                timer,
                acceptRide,
                updateStatus,
                socket: socketRef.current
            }}
        >
            {children}
        </RideContext.Provider>
    );
};

export const useRide = () => {
    const context = useContext(RideContext);
    if (!context) {
        throw new Error("useRide must be used within RideProvider");
    }
    return context;
};
