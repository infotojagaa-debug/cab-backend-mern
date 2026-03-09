import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  LogOut,
  History,
  ChevronRight,
  Navigation,
  Car,
  Search,
  Clock,
  Zap,
  Phone,
  MessageSquare,
  Star,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useRide as useRideContextHook } from "../contexts/RideContext";
import CabTypeSelector from "../components/CabTypeSelector";
import SOSButton from "../components/SOSButton";
import LocationAutocomplete from "../components/LocationAutocomplete";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import RoutingMachine from "../components/map/RoutingMachine";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";

// --- Custom Icons ---

const createSvgIcon = (color) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-lg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const pickupIcon = createSvgIcon("#22c55e");
const dropoffIcon = createSvgIcon("#ef4444");

const driverIcon = L.divIcon({
  className: "custom-car-marker",
  html: `<div class="bg-white p-1 rounded-full shadow-md border-2 border-blue-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="w-8 h-8"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// --- Ref-based Stable Polyline Component (Trip Route: pickup → dropoff) ---
const StableRoutePolyline = ({ pickup, dropoff, onRouteFound, color = '#3b82f6' }) => {
  const map = useMap();
  const routeRef = useRef(null);

  useEffect(() => {
    if (!pickup || !dropoff || !map) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dropoff[1]},${dropoff[0]}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

          if (routeRef.current) {
            map.removeLayer(routeRef.current);
          }

          routeRef.current = L.polyline(coordinates, {
            color,
            weight: 5,
            opacity: 0.7,
            lineJoin: 'round'
          }).addTo(map);

          if (onRouteFound) {
            onRouteFound({
              distance: (route.distance / 1000).toFixed(1),
              time: Math.round(route.duration / 60)
            });
          }
        }
      } catch (err) {
        console.error("StableRoute error:", err);
      }
    };

    fetchRoute();

    return () => {
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
        routeRef.current = null;
      }
    };
  }, [map, pickup[0], pickup[1], dropoff[0], dropoff[1], color]);

  return null;
};

// --- Live Driver Approach Route (driver → pickup or driver → dropoff) ---
const DriverRoutePolyline = ({ from, to }) => {
  const map = useMap();
  const routeRef = useRef(null);
  const flowRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    const fetchDriverRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

          // Remove old layers
          if (routeRef.current) map.removeLayer(routeRef.current);
          if (flowRef.current) map.removeLayer(flowRef.current);

          // Dashed amber polyline — driver approach path
          routeRef.current = L.polyline(coordinates, {
            color: '#fbbf24',   // amber-400
            weight: 6,
            opacity: 0.8,
            dashArray: '1, 10',
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);

          // Glowing white inner line for "flow" effect
          flowRef.current = L.polyline(coordinates, {
            color: '#fff',
            weight: 2,
            opacity: 0.6,
            dashArray: '10, 20',
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);

          // Smooth dash offset animation
          let offset = 0;
          const animate = () => {
            offset -= 1;
            if (flowRef.current) {
              flowRef.current.setStyle({ dashOffset: `${offset}` });
            }
            animationFrameRef.current = requestAnimationFrame(animate);
          };
          animate();
        }
      } catch (err) {
        console.error("DriverRoute error:", err);
      }
    };

    fetchDriverRoute();

    return () => {
      if (routeRef.current) map.removeLayer(routeRef.current);
      if (flowRef.current) map.removeLayer(flowRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [map, from[0], from[1], to[0], to[1]]);

  return null;
};

// Add global styles for smooth marker transitions
const markerStyles = `
  .leaflet-marker-icon {
    transition: all 0.5s linear !important;
  }
  .leaflet-container {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 14l-2-2m0 0l2-2m-2 2h12'/%3E%3C/svg%3E"), auto !important;
  }
  .leaflet-grab {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 14l-2-2m0 0l2-2m-2 2h12'/%3E%3C/svg%3E"), grab !important;
  }
  .leaflet-grabbing {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 14l-2-2m0 0l2-2m-2 2h12'/%3E%3C/svg%3E"), grabbing !important;
  }
`;

// --- Helper Components ---

const LocationMarker = ({ setPickupInput, setPickupCoords }) => {
  const map = useMap();
  const handleLocateStratergy = () => {
    map.locate().on("locationfound", function (e) {
      setPickupInput("Current Location");
      setPickupCoords([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  };
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleLocateStratergy}
          className="bg-white p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-center w-[34px] h-[34px]"
          title="Locate me"
        >
          <Navigation className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  );
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      const currentCenter = map.getCenter();
      const distance = Math.sqrt(
        Math.pow(currentCenter.lat - center[0], 2) +
        Math.pow(currentCenter.lng - center[1], 2)
      );
      if (distance > 0.005) {
        map.flyTo(center, map.getZoom() || 13);
      }
    }
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MapBoundsHandler = ({ pickup, dropoff, driver, status }) => {
  const map = useMap();
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!map) return;

    // Throttle map moves to once every 5 seconds to prevent jitter
    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) return;

    if (status === 'ongoing' && driver && dropoff) {
      const bounds = L.latLngBounds([[driver.lat, driver.lng], dropoff]);
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15, animate: true });
      lastUpdateRef.current = now;
    } else if (pickup && driver) {
      const bounds = L.latLngBounds([pickup, [driver.lat, driver.lng]]);
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15, animate: true });
      lastUpdateRef.current = now;
    }
  }, [pickup, dropoff, driver, map, status]);
  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size after a short delay to ensure container is ready
    const timer = setTimeout(() => {
      if (map && map.getContainer()) {
        map.invalidateSize();
      }
    }, 400);

    // Also invalidate on window resize with safety check
    const handleResize = () => {
      if (map && map.getContainer()) {
        map.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
};

// --- Main Home Component ---

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const { socket, activeRide: contextActiveRide, updateStatus } = useRideContextHook();

  const [pickupInput, setPickupInput] = useState("");
  const [dropoffInput, setDropoffInput] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [selectionMode, setSelectionMode] = useState("pickup");

  const [routeSummary, setRouteSummary] = useState(null);
  const [rideStatus, setRideStatus] = useState("idle");
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);

  const [selectedCabType, setSelectedCabType] = useState("Sedan");
  const [bookingType, setBookingType] = useState("instant");
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const [mapSearchInput, setMapSearchInput] = useState("");
  const [viewCoords, setViewCoords] = useState(null);
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [redoStack, setRedoStack] = useState([]);

  // Tracking specifics
  const [eta, setEta] = useState(null);
  const [distanceToPickup, setDistanceToPickup] = useState(null);
  const [throttledPickup, setThrottledPickup] = useState(null);
  const [stableEndpoints, setStableEndpoints] = useState({ p: null, d: null }); // For ref-based polyline stability
  const lastEtaRequestRef = useRef(0);
  const lastBoundsUpdateRef = useRef(0);

  useEffect(() => {
    if (contextActiveRide) {
      setCurrentRide(contextActiveRide);
      setRideStatus(contextActiveRide.status);

      // Initialize stable endpoints from context if valid
      if (['driver_assigned', 'arriving', 'arrived', 'ongoing'].includes(contextActiveRide.status)) {
        setStableEndpoints({
          p: [contextActiveRide.pickup.lat, contextActiveRide.pickup.lng],
          d: [contextActiveRide.dropoff.lat, contextActiveRide.dropoff.lng]
        });
      }
    } else {
      // If context ride is cleared and we aren't in 'completed' state (modal open), reset local
      if (rideStatus !== 'completed' && rideStatus !== 'idle') {
        handleReset();
      }
    }
  }, [contextActiveRide]);

  useEffect(() => {
    // Enable route rendering during planning phase (idle/searching)
    if ((rideStatus === 'idle' || rideStatus === 'searching') && pickupCoords && dropoffCoords) {
      setStableEndpoints({ p: pickupCoords, d: dropoffCoords });
    }
  }, [pickupCoords, dropoffCoords, rideStatus]);

  // Inject smooth marker transition styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = markerStyles;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    if (socket && currentRide?._id) {
      socket.emit("joinRide", currentRide._id);
      console.log("🚗 Home: Joining ride room:", `ride_${currentRide._id}`);
    }
  }, [socket, currentRide?._id]);

  useEffect(() => {
    if (!socket) return;
    const onStatusUpdate = (data) => {
      console.log("🚗 Home: Ride status update:", data);
      if (data.status) {
        setRideStatus(data.status);
        setCurrentRide(prev => ({
          ...prev,
          status: data.status,
          otp: data.otp || prev?.otp, // Ensure OTP is preserved/updated
          driver: data.driver || prev?.driver
        }));
        // Reset throttle on status change to ensure immediate routing update
        if (data.driver?.location) {
          setThrottledPickup([data.driver.location.lat, data.driver.location.lng]);
          lastEtaRequestRef.current = Date.now();
        }
      }
    };

    const onRideAccepted = (rideData) => {
      console.log("🚗 Home: Ride accepted event:", rideData);
      // Handle potential payload wrapper or direct object
      const ride = rideData.ride || rideData;
      const driverLoc = (rideData.driverLocation || rideData.driver?.location);

      setCurrentRide(ride);
      setRideStatus(ride.status);

      if (driverLoc) {
        setThrottledPickup([driverLoc.lat, driverLoc.lng]);
        setDriverLocation(driverLoc);
        // Always anchor the route to the PICKUP and DROPOFF point (Trip Path)
        setStableEndpoints({ p: [ride.pickup.lat, ride.pickup.lng], d: [ride.dropoff.lat, ride.dropoff.lng] });
      }
    };

    const onLocationUpdate = (location) => {
      setDriverLocation(location);
      // Trigger ETA calculation and coordinate throttling (every 10 seconds)
      const now = Date.now();
      if (now - lastEtaRequestRef.current > 10000) {
        if (rideStatus === 'driver_assigned' || rideStatus === 'arriving') {
          calculateETA(location, pickupCoords);
          setThrottledPickup([location.lat, location.lng]);
          lastEtaRequestRef.current = now;
        } else if (rideStatus === 'ongoing' && dropoffCoords) {
          calculateETA(location, dropoffCoords);
          setThrottledPickup([location.lat, location.lng]);
          lastEtaRequestRef.current = now;
        }
      }
    };

    const onDriverArrived = (rideData) => {
      console.log("🚗 Home: Driver arrived event:", rideData);
      setRideStatus("arrived");
      setCurrentRide(prev => ({ ...prev, status: "arrived" }));
      // Sync location immediately
      if (rideData.driver?.location) {
        setThrottledPickup([rideData.driver.location.lat, rideData.driver.location.lng]);
        setDriverLocation(rideData.driver.location);
      }
    };

    const onTripStarted = (rideData) => {
      console.log("🚗 Home: Trip started event:", rideData);
      setRideStatus("ongoing");
      setCurrentRide(prev => ({ ...prev, status: "ongoing" }));
      setIsOtpRequested(false);
      // Sync location immediately
      if (rideData.driver?.location) {
        setThrottledPickup([rideData.driver.location.lat, rideData.driver.location.lng]);
        setDriverLocation(rideData.driver.location);
        // Anchor the route to the pickup point and dropoff
        setStableEndpoints({ p: pickupCoords, d: dropoffCoords });
      } else {
        // Fallback if no location in event
        setStableEndpoints({ p: pickupCoords, d: dropoffCoords });
      }
    };

    const onTripCompleted = (rideData) => {
      console.log("🚗 Home: Trip completed event:", rideData);
      setRideStatus("completed");
      setCurrentRide(prev => ({ ...prev, status: "completed" }));
      setIsOtpRequested(false);
    };


    const onRideCancelled = (rideData) => {
      console.log("🚗 Home: Ride cancelled event:", rideData);
      handleReset();
      toast.error("Your ride has been cancelled.");
    };

    socket.on("rideStatusUpdate", onStatusUpdate);
    socket.on("rideAccepted", onRideAccepted);
    socket.on("driverLocationUpdate", onLocationUpdate);
    socket.on("driverLocation", onLocationUpdate); // Fallback
    socket.on("driverArrived", onDriverArrived);
    socket.on("tripStarted", onTripStarted);
    socket.on("tripCompleted", onTripCompleted);
    socket.on("rideCancelled", onRideCancelled);

    return () => {
      socket.off("rideStatusUpdate", onStatusUpdate);
      socket.off("rideAccepted", onRideAccepted);
      socket.off("driverLocationUpdate", onLocationUpdate);
      socket.off("driverLocation", onLocationUpdate);
      socket.off("driverArrived", onDriverArrived);
      socket.off("tripStarted", onTripStarted);
      socket.off("tripCompleted", onTripCompleted);
      socket.off("rideCancelled", onRideCancelled);
    };
  }, [socket, rideStatus, pickupCoords, dropoffCoords]);

  const mapCenter = React.useMemo(() => {
    return viewCoords || pickupCoords || dropoffCoords || [13.0827, 80.2707];
  }, [viewCoords, pickupCoords, dropoffCoords]);


  const reverseGeocode = async (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.warn("Invalid coordinates provided to reverseGeocode:", { lat, lng });
      return "Invalid Location";
    }
    try {
      const response = await fetch(getApiUrl(`/api/geocoding/reverse?lat=${lat}&lon=${lng}`));
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Reverse geocoding error (${response.status}):`, errorText);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const calculateETA = async (driverLoc, destinationLoc) => {
    if (!driverLoc || !destinationLoc) return;
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${driverLoc.lng},${driverLoc.lat};${destinationLoc[1]},${destinationLoc[0]}?overview=false`);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("OSRM Rate Limit Exceeded (429)");
        } else {
          console.error(`OSRM error: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        setEta(Math.round(route.duration / 60));
        setDistanceToPickup((route.distance / 1000).toFixed(1));
      }
    } catch (error) {
      console.error("ETA calculation error:", error);
    }
  };

  const handleMapClick = async (latlng) => {
    if (rideStatus !== 'idle') return;
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    if (selectionMode === 'pickup') {
      setPickupCoords([latlng.lat, latlng.lng]);
      setPickupInput(address);
      setSelectionMode('dropoff');
      setRedoStack([]);
    } else if (selectionMode === 'dropoff') {
      setDropoffCoords([latlng.lat, latlng.lng]);
      setDropoffInput(address);
      setSelectionMode('done');
      setRedoStack([]);
    }
  };

  const handleReset = () => {
    setPickupInput(""); setDropoffInput("");
    setPickupCoords(null); setDropoffCoords(null);
    setRouteSummary(null); setSelectionMode("pickup");
    setRideStatus("idle"); setDriverLocation(null);
    setCurrentRide(null); setViewCoords(null);
    setStableEndpoints({ p: null, d: null });
    setEta(null); setDistanceToPickup(null);
  };

  const handleUndo = () => {
    if (rideStatus !== 'idle') return;
    if (selectionMode === 'done') {
      setRedoStack(prev => [{ mode: 'done', coords: dropoffCoords, input: dropoffInput }, ...prev]);
      setDropoffCoords(null); setDropoffInput("");
      setRouteSummary(null); setSelectionMode('dropoff');
    } else if (selectionMode === 'dropoff') {
      setRedoStack(prev => [{ mode: 'dropoff', coords: pickupCoords, input: pickupInput }, ...prev]);
      setPickupCoords(null); setPickupInput("");
      setSelectionMode('pickup');
      setStableEndpoints({ p: null, d: null });
    }
  };

  const handleRedo = () => {
    if (rideStatus !== 'idle' || redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    if (next.mode === 'done') {
      setDropoffCoords(next.coords);
      setDropoffInput(next.input);
      setSelectionMode('done');
    } else if (next.mode === 'dropoff') {
      setPickupCoords(next.coords);
      setPickupInput(next.input);
      setSelectionMode('dropoff');
    }
    setRedoStack(rest);
  };



  const handleBookRide = async () => {
    if (!pickupCoords || !dropoffCoords || !routeSummary) return;
    setRideStatus("searching");
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await fetch(getApiUrl("/api/rides"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pickup: { address: pickupInput, lat: pickupCoords[0], lng: pickupCoords[1] },
          dropoff: { address: dropoffInput, lat: dropoffCoords[0], lng: dropoffCoords[1] },
          cabType: selectedCabType,
          distance: routeSummary.distance,
          fare: (routeSummary.distance * (selectedCabType === "Mini" ? 12 : selectedCabType === "Sedan" ? 15 : selectedCabType === "SUV" ? 20 : selectedCabType === "Auto" ? 9 : 6)).toFixed(0),
          bookingType,
          scheduledDateTime: bookingType === "scheduled" ? scheduledDateTime : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRide(data);
        if (socket) socket.emit("newRide", data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Booking failed (${res.status}):`, errorData);
        setRideStatus("idle");
        alert(errorData.error || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setRideStatus("idle");
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide?._id) return;
    if (window.confirm("Are you sure you want to cancel your ride?")) {
      const success = await updateStatus(currentRide._id, "cancelled");
      if (success) {
        handleReset();
        toast.info("Ride cancelled successfully.");
      }
    }
  };

  const handleSOSActivate = async (rideId) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await fetch(getApiUrl(`/api/rides/${rideId}/sos`), { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      alert("SOS Alert Sent! Emergency contacts notified.");
    } catch (err) { console.error("SOS error:", err); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen relative font-family-['Inter', sans-serif] overflow-x-hidden rh-root">
      {/* Cinematic Background Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: "url('/user-dashboard-bg.jpg')" }}
      />
      {/* Primary dark overlay */}
      <div className="fixed inset-0 z-0 bg-black/75 backdrop-blur-[1px]" />
      {/* Gradient fade from bottom for depth */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

      <div className="relative z-10 min-h-screen">
        {/* Cinematic Header */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0 z-[1000] shadow-2xl">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="bg-primary p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(255,153,0,0.4)] group-hover:scale-110 transition-transform duration-300">
                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="font-black text-lg sm:text-2xl text-white tracking-tighter uppercase">WeeFly</span>
            </div>
            <div className="flex items-center gap-8">
              {user && (
                <div className="hidden md:flex items-center gap-4 px-3 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Rider</p>
                    <p className="text-sm font-black text-white leading-none">{user.name}</p>
                  </div>
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full border-2 border-primary/40 shadow-lg" />
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/ride-history">
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all">
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">History</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-full text-destructive-foreground text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-4 pb-40">
          {/* Cinematic Search Hub */}
          <div className="mb-6 relative z-[2000]">
            <div className="max-w-3xl mx-auto px-4 py-8 rounded-[40px] bg-white/5 border-white/10 backdrop-blur-lg shadow-2xl">
              <h2 className="text-center text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Explore your journey</h2>
              <LocationAutocomplete
                placeholder="Where would you like to go?"
                value={mapSearchInput}
                onChange={setMapSearchInput}
                onSelect={(loc) => {
                  setViewCoords([loc.lat, loc.lng]);
                  setMapSearchInput(loc.address);
                }}
                icon={Search}
                className="h-16 [&_input]:h-16 [&_input]:text-lg [&_input]:font-black [&_input]:rounded-[2rem] [&_input]:border-none [&_input]:bg-white/10 [&_input]:text-white focus-within:[&_input]:text-gray-900 [&_input]:placeholder:text-white/30 focus-within:[&_input]:bg-white/20 focus-within:[&_input]:ring-8 focus-within:[&_input]:ring-primary/20 hover:[&_input]:bg-white/15 transition-all duration-500 shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Main Map Hub */}
              <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
                {/* Map Border with Cinematic Glow */}
                <div className="relative p-1.5 rounded-[42px] bg-gradient-to-br from-primary via-orange-500 to-amber-600 shadow-[0_20px_60px_rgba(255,153,0,0.25)] transition-all duration-700 hover:shadow-[0_30px_80px_rgba(255,153,0,0.35)]">
                  <div className="relative map-container-responsive overflow-hidden rounded-[38px] border-4 border-black/20 shadow-inner">
                    {rideStatus !== "idle" && (
                      <div className="absolute top-8 left-8 z-[600] bg-black/60 backdrop-blur-lg border border-white/20 px-8 py-4 rounded-3xl shadow-2xl flex flex-col gap-1 min-w-[240px] animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${rideStatus === 'completed' ? 'bg-green-500 animate-pulse' : 'bg-primary animate-ping'}`} />
                          <span className="font-black text-[11px] uppercase tracking-[0.2em] text-white">
                            {rideStatus === "searching" ? "Search" :
                              rideStatus === "driver_assigned" ? "Booked" :
                                rideStatus === "arriving" ? "Coming" :
                                  rideStatus === "arrived" ? "Here" :
                                    rideStatus === "ongoing" ? (distanceToPickup && parseFloat(distanceToPickup) <= 0.05 ? "Destination Reached!" : "Start") :
                                      rideStatus === "completed" ? "Done" : "Status unknown"}
                          </span>
                        </div>
                        {(rideStatus === 'driver_assigned' || rideStatus === 'arriving' || rideStatus === 'arrived' || rideStatus === 'ongoing') && eta && (
                          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">
                            {rideStatus === 'ongoing' ? 'Target ETA:' : 'Approach ETA:'} <span className="text-primary font-black">{eta} mins</span> • {distanceToPickup} km
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute top-8 right-8 z-[600] flex flex-col gap-3">
                      {(pickupCoords || dropoffCoords) && rideStatus === 'idle' && (
                        <button onClick={handleReset} className="bg-primary/90 hover:bg-primary text-white border border-primary/20 px-8 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300">Reset System</button>
                      )}
                      <div className="flex gap-3">
                        {(pickupCoords && rideStatus === 'idle') && (
                          <button onClick={handleUndo} className="bg-primary/90 hover:bg-primary text-white border border-primary/20 px-8 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300">Previous Step</button>
                        )}
                        {(redoStack.length > 0 && rideStatus === 'idle') && (
                          <button onClick={handleRedo} className="bg-primary/90 hover:bg-primary text-white border border-primary/20 px-8 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300">Next Step</button>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-full relative z-0">
                      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <MapResizer />
                        <LocationMarker setPickupInput={setPickupInput} setPickupCoords={setPickupCoords} />
                        <MapClickHandler onLocationSelect={handleMapClick} />
                        <MapUpdater center={mapCenter} />
                        <MapBoundsHandler
                          pickup={rideStatus === 'searching' ? null : pickupCoords}
                          dropoff={dropoffCoords}
                          driver={driverLocation}
                          status={rideStatus}
                        />
                        {pickupCoords && <Marker position={pickupCoords} icon={pickupIcon} />}
                        {dropoffCoords && <Marker position={dropoffCoords} icon={dropoffIcon} />}
                        {stableEndpoints.p && stableEndpoints.d && (
                          <StableRoutePolyline
                            pickup={stableEndpoints.p}
                            dropoff={stableEndpoints.d}
                            onRouteFound={setRouteSummary}
                            // Gray during driver approach so amber driver route is the hero line; blue during trip
                            color={['driver_assigned', 'arriving', 'arrived'].includes(rideStatus) ? '#d1d5db' : '#3b82f6'}
                          />
                        )}
                        {/* Live driver approach route — amber dashed line */}
                        {driverLocation && ['driver_assigned', 'arriving', 'arrived'].includes(rideStatus) && pickupCoords && (
                          <DriverRoutePolyline
                            from={[driverLocation.lat, driverLocation.lng]}
                            to={pickupCoords}
                          />
                        )}
                        {/* During trip: route from driver to dropoff */}
                        {driverLocation && rideStatus === 'ongoing' && dropoffCoords && (
                          <DriverRoutePolyline
                            from={[driverLocation.lat, driverLocation.lng]}
                            to={dropoffCoords}
                          />
                        )}
                        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />}
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* Sidebar Section */}
                <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                  <div className="bg-black/60 backdrop-blur-lg rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-white/10 p-8 space-y-8 animate-in slide-in-from-right-8 duration-700">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Prepare</h2>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Initiate transit protocol</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Origin Location</label>
                        <LocationAutocomplete
                          placeholder="Identify pickup point"
                          value={pickupInput}
                          onChange={setPickupInput}
                          onSelect={(loc) => {
                            setPickupCoords([loc.lat, loc.lng]);
                            setPickupInput(loc.address);
                            setSelectionMode('dropoff');
                            setRouteSummary(null);
                          }}
                          className="[&_input]:h-14 [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white focus-within:[&_input]:text-gray-900 [&_input]:placeholder:text-white/20 [&_input]:rounded-2xl"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Target Destination</label>
                        <LocationAutocomplete
                          placeholder="Specify dropoff point"
                          value={dropoffInput}
                          onChange={setDropoffInput}
                          onSelect={(loc) => {
                            setDropoffCoords([loc.lat, loc.lng]);
                            setDropoffInput(loc.address);
                            setSelectionMode('done');
                            setRouteSummary(null);
                          }}
                          className="[&_input]:h-14 [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white focus-within:[&_input]:text-gray-900 [&_input]:placeholder:text-white/20 [&_input]:rounded-2xl"
                        />
                      </div>
                    </div>

                    {routeSummary && (
                      <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-950 rounded-[2.5rem] text-white shadow-3xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                          <Zap className="w-16 h-16 text-primary fill-primary" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-3 h-3 text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">{routeSummary.distance} km • {routeSummary.time} min est.</p>
                          </div>
                          <p className="text-5xl font-black text-white tracking-tighter">₹{Math.round(routeSummary.distance * (selectedCabType === "Mini" ? 12 : selectedCabType === "Sedan" ? 15 : 20))}</p>
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2">Calculated Fare for {selectedCabType}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleBookRide}
                      disabled={rideStatus !== "idle" || !routeSummary}
                      className={`w-full py-10 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[0_15px_40px_rgba(255,153,0,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-95
                    ${rideStatus === 'idle' ? 'bg-primary hover:bg-orange-600 text-white' : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'}
                  `}
                    >
                      {rideStatus === "idle" ? "Confirm Launch" :
                        rideStatus === "searching" ? "Search" :
                          rideStatus === "driver_assigned" ? "Booked" :
                            rideStatus === "arriving" ? "Coming" :
                              rideStatus === "arrived" ? "Here" :
                                rideStatus === "ongoing" ? "Start" : "Processing..."}
                    </Button>

                    {['driver_assigned', 'arriving', 'arrived'].includes(rideStatus) && (
                      <Button
                        variant="outline"
                        onClick={handleCancelRide}
                        className="w-full py-8 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] text-white/40 border-white/10 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-500 group overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-red-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-3">
                          <XCircle className="w-4 h-4" /> Abort Mission
                        </span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Full Width vehicle selection or Live Tracking Dashboard */}
                {pickupCoords && dropoffCoords && (
                  <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    {rideStatus === 'idle' ? (
                      <CabTypeSelector selectedCabType={selectedCabType} onSelectCabType={setSelectedCabType} distance={routeSummary ? `${routeSummary.distance} km` : null} />
                    ) : (
                      <div className="bg-black/60 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-8 md:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                          {/* Ride Status Progress */}
                          <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-1">
                              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Live Tracking</h3>
                              <p className="text-primary text-[9px] font-black uppercase tracking-[0.2rem]">Mission Progress Status</p>
                            </div>
                            <div className="flex items-center justify-between relative px-2">
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2" />
                              {['searching', 'driver_assigned', 'arriving', 'arrived', 'ongoing', 'completed'].map((step, idx) => {
                                const allStatuses = ['searching', 'driver_assigned', 'arriving', 'arrived', 'ongoing', 'completed'];
                                const isPast = allStatuses.indexOf(rideStatus) >= allStatuses.indexOf(step);
                                const isCurrent = step === rideStatus;
                                return (
                                  <div key={step} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-500 ${isCurrent ? 'bg-primary border-primary ring-4 ring-primary/20 scale-125' : isPast ? 'bg-primary border-primary' : 'bg-gray-800 border-white/20'}`} />
                                  </div>
                                )
                              })}
                            </div>
                            <p className="text-white font-black text-[10px] uppercase tracking-widest text-center bg-white/5 py-2 rounded-full border border-white/10">
                              {rideStatus === "searching" ? "Scanning Fleet" :
                                rideStatus === "driver_assigned" ? "Ace Assigned" :
                                  rideStatus === "arriving" ? "Ace Incoming" :
                                    rideStatus === "arrived" ? "Ace at Origin" :
                                      rideStatus === "ongoing" ? "Target in Sight" : "Analysis Complete"}
                            </p>
                          </div>

                          {/* Driver Details Card (Full width equivalent) */}
                          <div className="lg:col-span-2">
                            {currentRide?.driver ? (
                              <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-6 flex items-center gap-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                <div className="relative z-10 flex-shrink-0">
                                  <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border border-white/10">
                                    👤
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-[#1a1a1a] flex items-center gap-1">
                                      <Star className="w-2.5 h-2.5 fill-white" /> {currentRide.driver.rating || '4.8'}
                                    </div>
                                  </div>
                                </div>
                                <div className="relative z-10 flex-1 flex justify-between items-center">
                                  <div>
                                    <h4 className="font-black text-2xl text-white tracking-tight mb-1">{currentRide.driver.name}</h4>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{currentRide.driver.vehicle || 'INTERCEPTOR'}</span>
                                      <span className="w-1 h-1 rounded-full bg-white/20" />
                                      <span className="text-[11px] font-black text-primary">XYZ-4567 • CARBON BLACK</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <a href={`tel:${currentRide.driver.phone}`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 transition-all duration-300">
                                      <Phone className="w-4 h-4" />
                                    </a>
                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300">
                                      <MessageSquare className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-32 space-y-4">
                                <div className="relative w-12 h-12">
                                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                                  <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Synchronizing with nearby Aces...</p>
                              </div>
                            )}
                          </div>

                          {/* SOS & Abort Buttons */}
                          <div className="lg:col-span-1 space-y-4">
                            <SOSButton onActivate={() => handleSOSActivate(currentRide?._id || currentRide?.rideId)} />
                            {['driver_assigned', 'arriving', 'arrived'].includes(rideStatus) && (
                              <button
                                onClick={handleCancelRide}
                                className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300"
                              >
                                Abort Mission
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {rideStatus === "completed" && (
          <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6 backdrop-blur-lg">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[4rem] p-12 max-w-md w-full text-center space-y-8 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)]">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30 shadow-[0_0_40px_rgba(255,153,0,0.2)]">
                <Car className="w-12 h-12 text-primary animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Transit End</h2>
                <p className="text-white/30 font-black uppercase text-[11px] tracking-[0.2em]">Mission Analysis & Feedback</p>
              </div>

              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-10 h-10 cursor-pointer transition-all duration-300 transform hover:scale-125 ${s <= (currentRide?.userRating || 0) ? 'fill-primary text-primary drop-shadow-[0_0_10px_rgba(255,153,0,0.4)]' : 'text-white/10'}`}
                    onClick={() => setCurrentRide(prev => ({ ...prev, userRating: s }))}
                  />
                ))}
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex justify-between items-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10 text-left">
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Final Fare</span>
                  <p className="text-3xl font-black text-white leading-none mt-1 group-hover:text-primary transition-colors">₹{currentRide?.fare}</p>
                </div>
                <div className="relative z-10 text-right">
                  <div className="bg-primary/20 px-4 py-2 rounded-full border border-primary/30">
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest">Paid</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (currentRide?.userRating) {
                    try {
                      const token = sessionStorage.getItem("authToken");
                      await fetch(getApiUrl(`/api/rides/${currentRide._id || currentRide.rideId}/rating`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ rating: currentRide.userRating })
                      });
                    } catch (e) { console.error(e); }
                  }
                  handleReset();
                }}
                className="w-full py-8 bg-primary hover:bg-orange-600 text-white font-black text-lg rounded-[2rem] shadow-xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
              >
                {currentRide?.userRating ? "Deactivate Link" : "Close Link"}
              </Button>
            </div>
          </div>
        )}

        <style>{`
          ${markerStyles}
          .map-container-responsive { height: 600px; }
          @media (max-width: 1024px) { .map-container-responsive { height: 450px; } }
          @media (max-width: 768px) { .map-container-responsive { height: 350px; } }
        `}</style>
      </div>
    </div>
  );
}
