import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../contexts/AppContext";
import { useRide } from "../../contexts/RideContext";
import DriverMap from "../../components/map/DriverMap"; // Reusing existing DriverMap as it has the logic
import LocationAutocomplete from "../../components/LocationAutocomplete";
import { Search, Car, Wallet, Star, MapPin, Phone, MessageSquare, Clock, Coins, TrendingUp, LogOut, ShieldAlert, CheckCircle, Navigation, AlertTriangle, Play, Check, Route, Trophy, Award } from "lucide-react";
import "../../global.css";
import { getApiUrl } from "@/utils/api";


function DriverDashboard() {
    const { user, logout } = useApp();
    const { activeRide, setActiveRide, newRequest, setNewRequest, timer, acceptRide, updateStatus, socket } = useRide();

    // --- States ---
    const [isOnline, setIsOnline] = useState(null); // Initial null to prevent flicker
    const [isAccepting, setIsAccepting] = useState(false);
    const [kycStatus, setKycStatus] = useState("approved"); // pending, approved, verified (approving by default for now as per design)
    const [showKycModal, setShowKycModal] = useState(false);

    const [earnings, setEarnings] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [walletBalance, setWalletBalance] = useState(0);
    const [rating, setRating] = useState(5.0);
    const [totalTrips, setTotalTrips] = useState(0);
    const [searchCoords, setSearchCoords] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [dailyMissions, setDailyMissions] = useState([]);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const [lastEarnings, setLastEarnings] = useState(0);
    const [otpInput, setOtpInput] = useState("");

    // --- Refs for Navigation ---
    const walletRef = React.useRef(null);
    const earningsRef = React.useRef(null);
    const missionsRef = React.useRef(null);
    const feedbackRef = React.useRef(null);

    const scrollToSection = (ref) => {
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight or subtle pulse if needed
            ref.current.classList.add('animate-pulse-subtle');
            setTimeout(() => ref.current.classList.remove('animate-pulse-subtle'), 2000);
        }
    };

    const [location, setLocation] = useState({ lat: 13.0827, lng: 80.2707 }); // Chennai Default
    const locationRef = React.useRef(location);
    const [routeCoords, setRouteCoords] = useState([]);
    const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
    const [routeTarget, setRouteTarget] = useState(null); // pickup or dropoff
    const [stableEndpoints, setStableEndpoints] = useState({ start: null, end: null });

    // --- Effects ---

    // Load initial status
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem("authToken");
                const res = await fetch(getApiUrl("/api/driver/profile"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsOnline(data.isOnline);
                    setRating(data.rating || 5.0);
                    setTotalTrips(data.totalTrips || 0);
                    setWalletBalance(data.walletBalance || 0);

                    if (data.earnings) {
                        setEarnings({
                            daily: data.earnings.today || 0,
                            weekly: data.earnings.week || 0,
                            monthly: data.earnings.month || 0
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching driver profile", err);
            }
        };
        fetchProfile();
    }, []);

    const fetchDailyMissions = async () => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl("/api/rides"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter today's completed rides
                const today = new Date().toDateString();
                const filtered = data.filter(r =>
                    new Date(r.createdAt).toDateString() === today &&
                    r.status === 'completed'
                );
                setDailyMissions(filtered);
            }
        } catch (err) {
            console.error("Error fetching daily missions", err);
        }
    };

    useEffect(() => {
        if (socket && activeRide?._id) {
            socket.emit("joinRide", activeRide._id);
            console.log("🚗 DriverDashboard: Joined ride room:", `ride_${activeRide._id}`);
        }
    }, [socket, activeRide?._id]);

    useEffect(() => {
        fetchDailyMissions();
    }, []);

    // Location Tracking & Simulation Effect
    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    useEffect(() => {
        let interval;
        if (isOnline) {
            interval = setInterval(() => {
                const currentLoc = locationRef.current;
                // If there's an active ride and it's in a state where the customer needs to see the driver
                if (activeRide && ["driver_assigned", "arriving", "arrived", "ongoing"].includes(activeRide.status)) {
                    // Check for auto-arrival if we are arriving at pickup
                    if (activeRide.status === "arriving") {
                        const distToPickup = Math.sqrt(
                            Math.pow(currentLoc.lat - activeRide.pickup.lat, 2) +
                            Math.pow(currentLoc.lng - activeRide.pickup.lng, 2)
                        );
                        if (distToPickup < 0.0005) { // ~50 meters approx
                            console.log("Auto-Arrival: Within 50m of pickup");
                            updateStatus(activeRide._id, "arrived");
                        }
                    }

                    // Check for auto-arrival at dropoff
                    if (activeRide.status === "ongoing") {
                        const distToDropoff = Math.sqrt(
                            Math.pow(currentLoc.lat - activeRide.dropoff.lat, 2) +
                            Math.pow(currentLoc.lng - activeRide.dropoff.lng, 2)
                        );
                        if (distToDropoff < 0.0005) {
                            console.log("Auto-Arrival: Within 50m of dropoff");
                            // We don't auto-complete, but we could show a message or alert
                            // For simulation purposes, let's just log it and maybe the UI will show "Reached"
                        }
                    }

                    // Simulation using Route Coordinates (Road Following)
                    if (routeCoords && routeCoords.length > 0) {
                        setCurrentRouteIndex(prevIndex => {
                            const nextIndex = prevIndex + 2; // Move 2 steps at a time
                            if (nextIndex < routeCoords.length) {
                                const nextPoint = routeCoords[nextIndex];
                                const newLoc = { lat: nextPoint.lat, lng: nextPoint.lng };

                                setLocation(newLoc);
                                if (socket?.connected) {
                                    socket.emit("driverLocation", {
                                        driverId: user?.id,
                                        rideId: activeRide?.id || activeRide?._id,
                                        location: newLoc
                                    });
                                }
                                return nextIndex;
                            }
                            return prevIndex;
                        });
                    } else {
                        // Emission for stationary states (No animation yet)
                        if (socket?.connected && (activeRide.status === 'driver_assigned' || activeRide.status === 'arrived')) {
                            socket.emit("driverLocation", {
                                driverId: user?.id,
                                rideId: activeRide?._id,
                                location: location
                            });
                        }

                        // Fallback to linear movement ONLY for movement phases...
                        const targetLoc = activeRide.status === 'ongoing' ? activeRide.dropoff : activeRide.pickup;
                        if (!targetLoc || (activeRide.status !== 'arriving' && activeRide.status !== 'ongoing')) return;

                        setLocation(prev => {
                            const step = 0.002;
                            const latDiff = targetLoc.lat - prev.lat;
                            const lngDiff = targetLoc.lng - prev.lng;
                            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                            if (distance < step) {
                                const finalLoc = { lat: targetLoc.lat, lng: targetLoc.lng };
                                if (socket?.connected) {
                                    socket.emit("driverLocation", { driverId: user?.id, rideId: activeRide?._id, location: finalLoc });
                                }
                                return finalLoc;
                            }

                            const newLoc = {
                                lat: prev.lat + (latDiff / distance) * step,
                                lng: prev.lng + (lngDiff / distance) * step
                            };

                            if (socket?.connected) {
                                socket.emit("driverLocation", { driverId: user?.id, rideId: activeRide?._id, location: newLoc });
                            }
                            return newLoc;
                        });
                    }
                } else {
                    // Just track if idle (No active ride)
                    if (navigator.geolocation && isOnline && (!activeRide || activeRide.status === 'idle')) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            setLocation(newLoc);
                            if (socket?.connected) {
                                socket.emit("driverLocation", { driverId: user.id, location: newLoc });
                            }
                        }, (err) => console.warn(err), { enableHighAccuracy: true });
                    }
                }
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isOnline, activeRide, socket, user, routeCoords, routeTarget]);

    // Manage simulation target and reset index when target changes
    useEffect(() => {
        if (!activeRide || !["arriving", "ongoing", "arrived", "driver_assigned"].includes(activeRide.status)) {
            setRouteTarget(null);
            setRouteCoords([]);
            setCurrentRouteIndex(0);
            setStableEndpoints({ start: null, end: null });
            return;
        }

        const newTarget = activeRide.status === 'ongoing' ? activeRide.dropoff : activeRide.pickup;

        if (!routeTarget || routeTarget.lat !== newTarget.lat || routeTarget.lng !== newTarget.lng) {
            console.log("Simulator: Target switched to", activeRide.status === 'ongoing' ? 'Dropoff' : 'Pickup');
            setRouteTarget(newTarget);
            setRouteCoords([]);
            setCurrentRouteIndex(0);

            // Set stable endpoints for the Route line (RoutingMachine)
            // This prevents the line from re-initializing every time the driver moves
            if (activeRide.status === 'ongoing') {
                setStableEndpoints({
                    start: [activeRide.pickup.lat, activeRide.pickup.lng],
                    end: [activeRide.dropoff.lat, activeRide.dropoff.lng]
                });
            } else {
                setStableEndpoints({
                    start: [locationRef.current.lat, locationRef.current.lng],
                    end: [activeRide.pickup.lat, activeRide.pickup.lng]
                });
            }
        }
    }, [activeRide?.status, activeRide?._id]);

    useEffect(() => {
        if (!socket?.connected) return;

        const onRideCancelled = (data) => {
            console.log("DriverDashboard: Ride cancelled:", data);
            setActiveRide(null);
            setRouteTarget(null);
            setRouteCoords([]);
            setCurrentRouteIndex(0);
            alert(data.message || "The ride has been cancelled by the customer.");
        };

        socket.on("rideCancelled", onRideCancelled);
        return () => {
            socket.off("rideCancelled", onRideCancelled);
        };
    }, [socket, setActiveRide]);

    // Sync isOnline with socket
    useEffect(() => {
        if (isOnline === null || !socket?.connected || !user?.id) return;

        if (isOnline) {
            console.log("Syncing: Driver going ONLINE");
            socket.emit("driverOnline", { driverId: user.id });
        } else {
            console.log("Syncing: Driver going OFFLINE");
            socket.emit("driverOffline", { driverId: user.id });
        }
    }, [isOnline, user?.id, socket]);

    // --- Actions ---

    const handleKycUpload = (e) => {
        e.preventDefault();
        setKycStatus("verifying");
        setTimeout(() => {
            setKycStatus("approved");
            setShowKycModal(false);
            alert("Documents uploaded successfully! Support will verify within 24 hours.");
        }, 2000);
    };

    const handleStartTrip = async () => {
        if (!otpInput || otpInput.length < 4) {
            return toast.error("Please enter the 4-digit OTP provided by the passenger.");
        }
        try {
            const success = await updateStatus(activeRide._id, "ongoing", { otp: otpInput });
            if (success) {
                toast.success("Operational protocol verified. Mission start.");
                setOtpInput(""); // Clear OTP on success
            } else {
                toast.error("Invalid OTP. Verification failed.");
            }
        } catch (error) {
            console.error("Trip start error:", error);
        }
    };


    const handleCompleteTrip = async () => {
        const success = await updateStatus(activeRide._id, "completed");
        if (success) {
            const earned = activeRide.fare * 0.8; // 20% Commission
            setEarnings(prev => ({ ...prev, daily: prev.daily + earned }));
            setWalletBalance(prev => prev + earned);
            setTotalTrips(prev => prev + 1);
            setLastEarnings(earned);
            setShowSuccessCard(true);
            fetchDailyMissions(); // Refresh the log
        }
    };

    const requestPayout = () => {
        if (walletBalance < 500) return alert("Minimum payout is ₹500");
        alert(`Payout request for ₹${walletBalance} sent to your bank account.`);
        setWalletBalance(0);
    };

    const handleAcceptRideAction = async (rideId) => {
        if (isAccepting) return;
        setIsAccepting(true);
        try {
            const success = await acceptRide(rideId);
            if (!success) {
                console.error("Failed to accept ride");
            }
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="dd-root">
            {/* Cinematic background */}
            <div className="dd-bg" />
            <div className="dd-overlay-dark" />
            <div className="dd-overlay-grad" />

            {/* Fixed frosted-glass header */}
            <header className="dd-header">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <Car className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">DriveDash</h1>
                    </div>
                    {/* Driver Name Display */}
                    <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-white/10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs">
                            {user?.name ? user.name[0].toUpperCase() : 'D'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Welcome back</span>
                            <span className="text-sm font-black text-white tracking-tight leading-none">{user?.name || 'Driver'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* KYC pill */}
                    {kycStatus === "pending" && (
                        <button
                            onClick={() => setShowKycModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full hover:bg-amber-400/30 transition-all"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" /> Complete KYC
                        </button>
                    )}
                    {/* Status + toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-white/10 border border-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full scale-90 sm:scale-100">
                        <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0 transition-all duration-500 ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_3px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-gray-500'}`} />
                        <span className={`text-[10px] sm:text-sm font-black uppercase tracking-widest ${isOnline ? 'text-emerald-300' : 'text-gray-400'}`}>
                            {isOnline ? 'On' : 'Off'}
                        </span>
                        <label className="switch">
                            <input type="checkbox" checked={isOnline || false} onChange={() => setIsOnline(!isOnline)} disabled={isOnline === null} />
                            <span className="slider round" />
                        </label>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to logout?")) {
                                logout();
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white text-red-400 transition-all duration-300 group shadow-lg shadow-red-500/10"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Stats strip */}
            <div className="dd-stats-strip">
                {[
                    { label: "Today", value: `₹${Math.round(earnings.daily)}`, icon: <Coins className="w-5 h-5 sm:w-6 sm:h-6" />, ref: earningsRef },
                    { label: 'Rating', value: `${rating}`, icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, ref: feedbackRef },
                    { label: 'Trips', value: totalTrips, icon: <Route className="w-5 h-5 sm:w-6 sm:h-6" />, ref: missionsRef },
                    { label: 'Wallet', value: `₹${Math.round(walletBalance)}`, icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />, ref: walletRef },
                ].map(s => (
                    <button
                        key={s.label}
                        className="dd-stat-card group outline-none"
                        onClick={() => scrollToSection(s.ref)}
                    >
                        <span className="text-primary mb-1 group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                        <span className="text-[7px] sm:text-[9px] font-black text-white/50 uppercase tracking-[0.1em] sm:tracking-widest">{s.label}</span>
                        <span className="text-base sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors duration-300">{s.value}</span>
                    </button>
                ))}
            </div>

            {/* Main layout */}
            <main className="dd-main">

                {/* Left col: Map + Active Trip */}
                <div className="dd-left">

                    {/* Map card with gradient border */}
                    <div className="dd-map-border">
                        <div className="dd-map-inner">
                            <DriverMap
                                currentLocation={location}
                                pickupLocation={useMemo(() => (activeRide ? [activeRide.pickup.lat, activeRide.pickup.lng] : null), [activeRide?.pickup?.lat, activeRide?.pickup?.lng])}
                                dropoffLocation={useMemo(() => (activeRide ? [activeRide.dropoff.lat, activeRide.dropoff.lng] : null), [activeRide?.dropoff?.lat, activeRide?.dropoff?.lng])}
                                routeStart={stableEndpoints.start}
                                routeEnd={stableEndpoints.end}
                                searchCoords={searchCoords}
                                onCoordinatesFound={setRouteCoords}
                            />

                            {/* Search overlay */}
                            <div className="absolute top-4 left-4 right-4 z-[1001] pointer-events-none">
                                <div className="max-w-md pointer-events-auto">
                                    <LocationAutocomplete
                                        placeholder="Search for a location..."
                                        value={searchInput}
                                        onChange={setSearchInput}
                                        onSelect={(loc) => { setSearchCoords([loc.lat, loc.lng]); setSearchInput(loc.address); }}
                                        icon={Search}
                                        className="shadow-2xl"
                                    />
                                </div>
                            </div>

                            {/* Offline overlay */}
                            {!isOnline && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center text-white text-center p-4 sm:p-6">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-5 border border-white/20 text-white/40">
                                        <ShieldAlert className="w-7 h-7 sm:w-10 sm:h-10" />
                                    </div>
                                    <h3 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2 uppercase tracking-tight">You are Offline</h3>
                                    <p className="text-[10px] sm:text-base text-white/70 font-semibold px-4">Go online to receive ride requests</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Trip Panel */}
                    {activeRide && (
                        <div className="dd-glass-card animate-in slide-in-from-bottom-4 duration-500 p-4 sm:p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-400/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl border border-amber-400/30 text-amber-500 font-black">
                                        {activeRide.customer?.name ? activeRide.customer.name[0].toUpperCase() : 'C'}
                                    </div>
                                    <div className="min-w-0">
                                        <strong className="text-base sm:text-lg block font-black text-gray-900 leading-tight truncate">{activeRide.customer?.name || 'Customer'}</strong>
                                        <p className="text-[10px] sm:text-sm font-semibold text-gray-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap overflow-hidden">
                                            <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full flex-shrink-0 ${activeRide.status === 'ongoing' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <span className="truncate">{['driver_assigned', 'arriving', 'arrived'].includes(activeRide.status) ? 'Pickup' : 'Drop'}: {activeRide.status === 'ongoing' ? activeRide.dropoff.address : activeRide.pickup.address}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="self-start sm:self-center px-3 sm:px-4 py-1 sm:py-1.5 bg-amber-100 text-amber-700 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
                                    {activeRide.status.replace('_', ' ')}
                                </span>
                            </div>

                            {activeRide.status === 'arrived' && (
                                <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] shadow-xl shadow-amber-900/5 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                                            <ShieldAlert className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Security Handshake</h4>
                                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Verification Required</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength="4"
                                                placeholder="ENTER PASSENGER OTP"
                                                value={otpInput}
                                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                className="w-full py-5 bg-white border-2 border-amber-200 rounded-2xl text-center text-3xl font-black text-gray-900 tracking-[0.5em] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-[10px]"
                                            />
                                        </div>

                                        <button
                                            className="w-full py-5 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                            onClick={handleStartTrip}
                                        >
                                            <Play className="w-5 h-5 fill-white" /> Start Mission
                                        </button>
                                        <p className="text-center text-[9px] font-bold text-amber-600 uppercase tracking-widest px-4">
                                            Ask the passenger for their 4-digit security code
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeRide.status === 'ongoing' && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-bold text-center text-sm flex items-center justify-center gap-2">
                                    <Route className="w-4 h-4" />
                                    {Math.sqrt(Math.pow(location.lat - activeRide.dropoff.lat, 2) + Math.pow(location.lng - activeRide.dropoff.lng, 2)) < 0.0005
                                        ? "Destination Reached!"
                                        : "Heading to destination..."}
                                </div>
                            )}

                            <div className="mb-4 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Fare</span>
                                <span className="text-xl font-black text-gray-900">₹{activeRide.fare}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-4 rounded-xl bg-gray-100 text-gray-800 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                                    <Phone className="w-4 h-4" /> Call
                                </button>
                                {activeRide.status === 'driver_assigned' && (
                                    <button className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2" onClick={() => updateStatus(activeRide._id, "arriving")}>
                                        <Navigation className="w-4 h-4" /> Coming
                                    </button>
                                )}
                                {activeRide.status === 'arriving' && (
                                    <button className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2" onClick={() => updateStatus(activeRide._id, "arrived")}>
                                        <MapPin className="w-4 h-4" /> Here
                                    </button>
                                )}
                                {activeRide.status === 'arrived' && (
                                    <div className="col-span-1 opacity-50 cursor-not-allowed">
                                        <button className="w-full py-4 rounded-xl font-bold text-gray-400 bg-gray-200 flex items-center justify-center gap-2" disabled>
                                            <Play className="w-4 h-4 text-gray-300" /> Start
                                        </button>
                                    </div>
                                )}
                                {activeRide.status === 'ongoing' && (
                                    <button className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2" onClick={handleCompleteTrip}>
                                        <CheckCircle className="w-4 h-4" /> Done
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Daily Missions Log */}
                    <div ref={missionsRef} className="dd-glass-card hover:scale-[1.005] transition-all duration-300 p-5 sm:p-7">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-[10px] sm:text-[12px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Mission Log</h3>
                                <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Shift Records</p>
                            </div>
                            <div className="bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5 sm:gap-2">
                                <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500" />
                                <span className="text-[8px] sm:text-[10px] font-black text-emerald-700 uppercase">{dailyMissions.length} OK</span>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {dailyMissions.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                        <Route className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No missions logged today</p>
                                </div>
                            ) : (
                                dailyMissions.map((mission, idx) => (
                                    <div key={mission._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 animate-in slide-in-from-left-4 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-black text-xs text-gray-400">
                                                    #{dailyMissions.length - idx}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                                                    <p className="text-[11px] font-black text-emerald-600 uppercase">Mission Success</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Earnings</p>
                                                <p className="text-[13px] font-black text-gray-900">₹{(mission.fare * 0.8).toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                            <div className="flex items-start gap-2 text-[10px] font-bold text-gray-600">
                                                <span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span className="line-clamp-2 break-words">{mission.pickup.address}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-[10px] font-bold text-gray-600">
                                                <span className="w-1.5 h-1.5 mt-1 rounded-full bg-red-500 flex-shrink-0" />
                                                <span className="line-clamp-2 break-words">{mission.dropoff.address}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> {new Date(mission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Route className="w-3 h-3" /> {mission.distance}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{mission.cabType}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="dd-right">

                    {/* Wallet */}
                    <div ref={walletRef} className="dd-glass-card text-center hover:scale-[1.02] transition-all duration-300 group">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">My Wallet</p>
                        <div className="text-5xl font-black mb-5 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            ₹{Math.round(walletBalance)}
                        </div>
                        <button
                            className="w-full py-4 rounded-2xl font-black text-gray-900 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-amber-300/40 hover:shadow-amber-400/60 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                            onClick={requestPayout}
                        >
                            <Coins className="w-4 h-4" /> Request Payout (₹{Math.round(walletBalance)})
                        </button>
                    </div>

                    {/* Earnings */}
                    <div ref={earningsRef} className="dd-glass-card hover:scale-[1.02] transition-all duration-300">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pb-4 border-b border-gray-100">Earnings Overview</h3>
                        {[
                            { label: 'Today', value: earnings.daily, icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
                            { label: 'This Week', value: earnings.weekly, icon: <Clock className="w-4 h-4 text-amber-500" /> },
                            { label: 'This Month', value: earnings.monthly, icon: <Wallet className="w-4 h-4 text-blue-500" /> },
                        ].map((item, i) => (
                            <div key={item.label} className={`flex items-center justify-between py-3.5 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                                </div>
                                <strong className="text-lg font-black text-gray-900">₹{Math.round(item.value)}</strong>
                            </div>
                        ))}
                    </div>

                    {/* Feedback */}
                    <div ref={feedbackRef} className="dd-glass-card hover:scale-[1.02] transition-all duration-300">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 pb-4 border-b border-gray-100">Recent Feedback</h3>
                        {[
                            { stars: 5, text: '"Very polite driver, car was clean."', time: 'Yesterday' },
                            { stars: 4, text: '"On time and safe driving."', time: '2 days ago' },
                        ].map((fb, i) => (
                            <div key={i} className={`${i > 0 ? 'pt-4 border-t border-gray-50 mt-4' : ''}`}>
                                <div className="flex gap-0.5 mb-1.5">
                                    {[...Array(5)].map((_, s) => (
                                        <Star key={s} className={`w-3.5 h-3.5 ${s < fb.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <p className="text-sm font-semibold text-gray-700 leading-relaxed">{fb.text}</p>
                                <small className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{fb.time}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Incoming Request Modal */}
            {newRequest && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <div>
                                <p className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Incoming</p>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">New Ride!</h2>
                            </div>
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                                    <circle r="20" cx="24" cy="24" className="stroke-red-100 fill-none" strokeWidth="4" />
                                    <circle r="20" cx="24" cy="24" className="stroke-red-500 fill-none" strokeWidth="4"
                                        style={{ strokeDasharray: '125.6', strokeDashoffset: `${125.6 - (timer / 15) * 125.6}`, transition: 'stroke-dashoffset 1s linear' }} />
                                </svg>
                                <span className="text-base sm:text-lg font-black text-red-500 relative z-10">{timer}</span>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3 mb-6">
                            <div className="flex items-start gap-2 sm:gap-3 bg-green-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-green-100">
                                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 mt-1 rounded-full bg-green-500 flex-shrink-0" />
                                <span className="font-bold text-gray-800 text-xs sm:text-sm leading-snug truncate">{newRequest.pickup.address}</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3 bg-red-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-red-100">
                                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 mt-1 rounded-full bg-red-500 flex-shrink-0" />
                                <span className="font-bold text-gray-800 text-xs sm:text-sm leading-snug truncate">{newRequest.dropoff.address}</span>
                            </div>
                            <div className="flex gap-2 sm:gap-3 pt-1">
                                <span className="text-[10px] sm:text-sm font-black text-gray-700 bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2"><Route className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> {newRequest.distance}</span>
                                <span className="text-[10px] sm:text-sm font-black text-emerald-700 bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-100 flex items-center gap-1.5 sm:gap-2"><Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> ₹{newRequest.fare}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-5 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all" onClick={() => setNewRequest(null)}>Decline</button>
                            <button
                                className={`flex-[2] py-5 font-black rounded-2xl shadow-xl transition-all text-base flex items-center justify-center gap-2
                                    ${isAccepting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 shadow-amber-300/40 hover:scale-[1.02] active:scale-95'}`}
                                onClick={() => handleAcceptRideAction(newRequest.rideId || newRequest._id)}
                                disabled={isAccepting}
                            >
                                {isAccepting ? (<><div className="w-5 h-5 border-4 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />Accepting...</>) : <><Check className="w-4 h-4" /> Accept Ride</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KYC Modal */}
            {showKycModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[6000] flex items-center justify-center p-4">
                    <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[35px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Driver Onboarding</h2>
                        <p className="text-gray-400 font-medium mb-6 sm:mb-8 text-xs">Upload documents to verify your account.</p>
                        <form onSubmit={handleKycUpload} className="space-y-4 sm:space-y-5">
                            {['Driving License', 'Vehicle Insurance', 'Identity Card'].map((label) => (
                                <div key={label}>
                                    <label className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 sm:mb-2">{label}</label>
                                    <input type="file" required className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl focus:border-amber-400 transition-all outline-none cursor-pointer text-[10px] sm:text-sm text-gray-500" />
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                                <button type="button" className="font-black text-gray-400 px-4 sm:px-6 py-2 hover:text-gray-600 transition-colors text-xs sm:text-base" onClick={() => setShowKycModal(false)}>Cancel</button>
                                <button type="submit" className="font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-md shadow-amber-300/30 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-base">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Trip Success Modal */}
            {showSuccessCard && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[7000] flex items-center justify-center p-4 overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-900 to-black w-full max-w-md rounded-[2.5rem] sm:rounded-[50px] p-8 sm:p-12 text-center border border-white/10 shadow-[0_0_100px_rgba(251,191,36,0.15)] animate-in zoom-in-95 duration-500 relative">
                        <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] border-4 border-black animate-bounce">
                                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
                            </div>
                        </div>

                        <div className="mt-8 sm:mt-8 space-y-1 sm:space-y-2 mb-8 sm:mb-10">
                            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">Victory!</h2>
                            <p className="text-amber-400/60 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Operational Success</p>
                        </div>

                        <div className="bg-white/5 rounded-[2rem] sm:rounded-[35px] border border-white/10 p-6 sm:p-10 mb-8 sm:mb-10 relative group overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 sm:mb-3">Net Earnings</p>
                                <div className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-2">₹{lastEarnings.toFixed(0)}</div>
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-emerald-400 font-bold text-[10px] sm:text-xs">
                                    <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Settled
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <button
                                onClick={() => setShowSuccessCard(false)}
                                className="w-full py-4 sm:py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-sm sm:text-base rounded-2xl sm:rounded-3xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Back to Base
                            </button>
                            <p className="text-[7px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest">Awaiting deployment...</p>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                /* BG image */
                .dd-root { position: relative; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; }
                .dd-bg { position: fixed; inset: 0; z-index: 0; background: url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat; }
                .dd-overlay-dark { position: fixed; inset: 0; z-index: 1; background: rgba(0,0,0,0.85); }
                .dd-overlay-grad { position: fixed; inset: 0; z-index: 2; background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%); }
                
                @media (max-width: 640px) {
                    .dd-overlay-dark { background: rgba(0,0,0,0.9); }
                }

                /* Header */
                .dd-header { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; sm:padding: 14px 28px; background: rgba(0,0,0,0.7); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); }

                /* Stats strip */
                .dd-stats-strip { position: relative; z-index: 10; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.08); }
                @media (max-width: 480px) { .dd-stats-strip { grid-template-columns: repeat(2, 1fr); } }
                .dd-stat-card { display: flex; flex-direction: column; align-items: center; padding: 14px 8px; sm:padding: 18px 12px; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); transition: all 0.3s; cursor: pointer; border: none; outline: none; }
                .dd-stat-card:hover { background: rgba(251,191,36,0.15); }

                /* Main layout */
                .dd-main { position: relative; z-index: 10; display: grid; grid-template-columns: 1fr; gap: 16px; sm:gap: 24px; padding: 16px; sm:padding: 24px 24px 40px; }
                @media (min-width: 1024px) { .dd-main { grid-template-columns: 1fr 340px; gap: 24px; } }
                .dd-left { display: flex; flex-direction: column; gap: 16px; sm:gap: 24px; }
                .dd-right { display: flex; flex-direction: column; gap: 16px; sm:gap: 24px; }

                /* Map with gradient border */
                .dd-map-border { padding: 2px; sm:padding: 3px; border-radius: 20px; sm:border-radius: 24px; background: linear-gradient(135deg, #fbbf24, #f59e0b, #f97316); box-shadow: 0 8px 32px rgba(251,191,36,0.2); }
                .dd-map-inner { position: relative; height: 300px; sm:height: 400px; lg:height: 500px; border-radius: 18px; sm:border-radius: 21px; overflow: hidden; background: #0a0a0f; }

                /* Cards */
                .dd-glass-card { background: rgba(255,255,255,0.98); backdrop-filter: blur(24px); padding: 20px; sm:padding: 28px; border-radius: 20px; sm:border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

                /* Toggle Switch */
                .switch { position: relative; display: inline-block; width: 44px; sm:width: 54px; height: 24px; sm:height: 28px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.2); transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 18px; sm:height: 20px; width: 18px; sm:width: 20px; left: 3px; sm:left: 4px; bottom: 3px; sm:bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background: #10b981; }
                input:checked + .slider:before { transform: translateX(20px); sm:translateX(26px); }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out both; }

                @keyframes pulseSubtle {
                    0% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
                    50% { box-shadow: 0 0 0 4px rgba(251,191,36,0.2); }
                    100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
                }
                .animate-pulse-subtle { animation: pulseSubtle 1s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

export default DriverDashboard;
