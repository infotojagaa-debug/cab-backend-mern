import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import RoutingMachine from "../map/RoutingMachine";
import { Navigation } from "lucide-react";

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

// --- Custom Icons ---
// Helper to create SVG Icon (reusing from Home.jsx for consistency)
const createSvgIcon = (color) => {
    return L.divIcon({
        className: "custom-map-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-lg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

const pickupIcon = createSvgIcon("#22c55e"); // Green-500
const dropoffIcon = createSvgIcon("#ef4444"); // Red-500

const driverIcon = L.divIcon({
    className: "custom-car-marker",
    html: `<div class="bg-white p-1 rounded-full shadow-md border-2 border-blue-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="w-8 h-8"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Component to update map view when props change
const MapUpdater = ({ center, bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    useEffect(() => {
        if (!bounds && center) {
            const currentCenter = map.getCenter();
            const distance = Math.sqrt(
                Math.pow(currentCenter.lat - center[0], 2) +
                Math.pow(currentCenter.lng - center[1], 2)
            );

            // Only re-center if the distance is significant (prevents shaking during simulation)
            if (distance > 0.01) {
                map.flyTo(center, map.getZoom());
            }
        }
    }, [center, bounds, map]);

    return null;
};

const DriverMap = ({ currentLocation, pickupLocation, dropoffLocation, routeStart, routeEnd, searchCoords, onCoordinatesFound }) => {
    // Default center (Tamil Nadu) if no location
    const defaultCenter = [11.1271, 78.6569];
    const center = searchCoords || (currentLocation ? [currentLocation.lat, currentLocation.lng] : defaultCenter);

    // Determine bounds if both pickup and dropoff exist
    const bounds = React.useMemo(() => {
        return (pickupLocation && dropoffLocation)
            ? L.latLngBounds([pickupLocation, dropoffLocation])
            : null;
    }, [pickupLocation, dropoffLocation]);

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={center}
                zoom={currentLocation ? 13 : 7}
                scrollWheelZoom={true}
                zoomControl={true}
                style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapResizer />
                <MapUpdater center={center} bounds={bounds} />

                {/* Driver Marker */}
                {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* Pickup Marker */}
                {pickupLocation && (
                    <Marker position={pickupLocation} icon={pickupIcon}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {/* Dropoff Marker */}
                {dropoffLocation && (
                    <Marker position={dropoffLocation} icon={dropoffIcon}>
                        <Popup>Dropoff Location</Popup>
                    </Marker>
                )}

                {/* New Segment-based Route */}
                {routeStart && routeEnd && (
                    <RoutingMachine
                        pickup={routeStart}
                        dropoff={routeEnd}
                        onCoordinatesFound={onCoordinatesFound}
                    />
                )}
            </MapContainer>

            {/* Legend / Info Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-xs space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
                    <span>Your Location</span>
                </div>
                {pickupLocation && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                        <span>Pickup</span>
                    </div>
                )}
                {dropoffLocation && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                        <span>Dropoff</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverMap;
