import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

/**
 * A helper component that renders a route between pickup and dropoff points.
 * Uses leaflet-routing-machine.
 */
const RoutingMachine = ({ pickup, dropoff, onRouteFound, onCoordinatesFound }) => {
    const map = useMap();

    useEffect(() => {
        if (!pickup || !dropoff || !map) return;

        let routingControl = null;

        try {
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(pickup[0], pickup[1]),
                    L.latLng(dropoff[0], dropoff[1])
                ],
                router: L.Routing.osrmv1({
                    serviceUrl: "https://router.project-osrm.org/route/v1"
                }),
                routeWhileDragging: false,
                geocoder: false,
                show: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false, // Disable to prevent jitter
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: '#6FA1EC', weight: 4 }]
                },
                createMarker: () => null
            }).addTo(map);

            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }

            routingControl.on('routesfound', (e) => {
                const routes = e.routes;
                const summary = routes[0].summary;

                if (onRouteFound) {
                    onRouteFound({
                        distance: (summary.totalDistance / 1000).toFixed(1),
                        time: Math.round(summary.totalTime / 60)
                    });
                }

                if (onCoordinatesFound && routes[0].coordinates) {
                    onCoordinatesFound(routes[0].coordinates);
                }
            });

            routingControl.on('routingerror', (e) => {
                console.warn("Routing error (OSRM might be rate limiting):", e);
            });

        } catch (err) {
            console.error("Error initializing routing control:", err);
        }

        return () => {
            if (routingControl && map) {
                try {
                    routingControl.off('routesfound');
                    routingControl.off('routingerror');
                    routingControl.setWaypoints([]);
                    const container = routingControl.getContainer();
                    if (container && container.parentNode) {
                        try {
                            container.parentNode.removeChild(container);
                        } catch (e) { /* Ignore parent tree changes */ }
                    }
                    map.removeControl(routingControl);
                } catch (e) {
                    console.warn("Handled error during routing control removal:", e);
                }
            }
        };
    }, [map, pickup, dropoff]);

    return null;
};

export default RoutingMachine;
