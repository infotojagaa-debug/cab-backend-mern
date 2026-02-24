import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Car, Users, MapPin, Activity } from "lucide-react";

// --- Custom Icons ---
const createDriverIcon = (status) => {
    const color = status === 'active' ? '#fbbf24' : '#ef4444'; // amber-400 or red-500
    const shadowColor = status === 'active' ? 'rgba(251,191,36,0.6)' : 'rgba(239,68,68,0.6)';

    return L.divIcon({
        className: "custom-admin-car-marker",
        html: `<div class="bg-black/80 p-1.5 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-md transition-all duration-300 transform hover:scale-125 ${status === 'active' ? 'animate-pulse-slow' : ''}" style="box-shadow: 0 0 20px ${shadowColor}">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-6 h-6"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

const createRideIcon = (type) => {
    const color = type === 'pickup' ? '#22c55e' : '#3b82f6'; // emerald-500 or blue-500
    return L.divIcon({
        className: "custom-admin-ride-marker",
        html: `<div class="bg-black/80 p-1 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-md">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" class="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        // Initial invalidation
        map.invalidateSize();

        // Follow-up invalidations to handle layout shifts
        const timers = [100, 300, 600, 1000].map(delay =>
            setTimeout(() => map.invalidateSize(), delay)
        );

        return () => timers.forEach(clearTimeout);
    }, [map]);
    return null;
};

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

const AdminMap = ({ activeRides = [], allDrivers = [], focusLocation = null }) => {
    const defaultCenter = [13.0827, 80.2707]; // Chennai default

    return (
        <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                style={{ background: '#0a0a0a' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <MapResizer />
                {focusLocation?.lat && focusLocation?.lng && (
                    <MapController center={[focusLocation.lat, focusLocation.lng]} zoom={15} />
                )}

                {/* Drivers Markers */}
                {allDrivers.map((driver) => (
                    driver.location?.lat && driver.location?.lng && (
                        <Marker
                            key={`driver-${driver._id}`}
                            position={[driver.location.lat, driver.location.lng]}
                            icon={createDriverIcon(driver.status)}
                        >
                            <Popup className="admin-map-popup">
                                <div className="p-2 min-w-[150px]">
                                    <p className="font-black text-slate-900">{driver.name}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500">{driver.status}</p>
                                    {driver.email && <p className="text-xs text-slate-400 mt-1">{driver.email}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Active Rides Markers */}
                {activeRides.map((ride) => (
                    <React.Fragment key={`ride-${ride._id}`}>
                        {ride.pickup?.lat && ride.pickup?.lng && (
                            <Marker position={[ride.pickup.lat, ride.pickup.lng]} icon={createRideIcon('pickup')}>
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-emerald-600 uppercase text-[10px]">Pickup</p>
                                        <p className="text-xs font-bold">{ride.pickup.address}</p>
                                        <p className="text-[10px] mt-2 text-slate-400">Rider: {ride.customer?.name}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                        {ride.dropoff?.lat && ride.dropoff?.lng && (
                            <Marker position={[ride.dropoff.lat, ride.dropoff.lng]} icon={createRideIcon('dropoff')}>
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-blue-600 uppercase text-[10px]">Destination</p>
                                        <p className="text-xs font-bold">{ride.dropoff.address}</p>
                                        <p className="text-[10px] mt-2 text-slate-400">Total: ₹{ride.fare}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute top-6 left-6 z-[400] flex flex-col gap-3 group">
                <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-4 min-w-[200px]">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-3">WeeFly Intelligence</h4>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                <span className="text-[11px] font-bold text-white/70">Online Drivers</span>
                            </div>
                            <span className="text-xs font-black text-amber-400">{allDrivers.filter(d => d.status === 'active').length}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                <span className="text-[11px] font-bold text-white/70">Pickup Points</span>
                            </div>
                            <span className="text-xs font-black text-emerald-400">{activeRides.length}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                <span className="text-[11px] font-bold text-white/70">In-Transit</span>
                            </div>
                            <span className="text-xs font-black text-blue-400">{activeRides.filter(r => r.status === 'ongoing').length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMap;
