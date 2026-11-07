import { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { RouteWaypoint } from '../../services/tollEngine';

interface GoogleMapRouteDirectorProps {
  origin: RouteWaypoint;
  destination: RouteWaypoint;
  waypoints?: RouteWaypoint[];
  defaultPolyline: [number, number][]; // [lat, lng][] from toll engine
  onPathUpdated?: (coords: Array<{ lat: number; lng: number }>) => void;
}

/**
 * GoogleMapRouteDirector
 * 
 * Accurately traces and marks the road trip route on the Google Map using:
 * 1. High-fidelity turn-by-turn geometry via google.maps.DirectionsService when available.
 * 2. Instant fallback to calculated highway corridor polyline.
 * 3. Dual-layer visual rendering (deep casing + vibrant route line).
 * 4. Automatic camera viewport bounds fitting across all stops.
 */
export function GoogleMapRouteDirector({
  origin,
  destination,
  waypoints = [],
  defaultPolyline,
  onPathUpdated
}: GoogleMapRouteDirectorProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsPath, setDirectionsPath] = useState<Array<{ lat: number; lng: number }> | null>(null);

  const casingPolylineRef = useRef<google.maps.Polyline | null>(null);
  const corePolylineRef = useRef<google.maps.Polyline | null>(null);

  // 1. Calculate turn-by-turn driving route via Google Maps Directions Service
  useEffect(() => {
    if (!map || !routesLib || typeof google === 'undefined' || !google.maps) return;

    try {
      const directionsService = new routesLib.DirectionsService();

      const originLoc = { lat: origin.lat, lng: origin.lng };
      const destLoc = { lat: destination.lat, lng: destination.lng };
      const intermediateWaypoints = waypoints.map(w => ({
        location: { lat: w.lat, lng: w.lng },
        stopover: true
      }));

      directionsService.route(
        {
          origin: originLoc,
          destination: destLoc,
          waypoints: intermediateWaypoints,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const overview = result.routes[0]?.overview_path;
            if (overview && overview.length > 0) {
              const highResPoints = overview.map(pt => ({ lat: pt.lat(), lng: pt.lng() }));
              setDirectionsPath(highResPoints);
              if (onPathUpdated) onPathUpdated(highResPoints);
            }
          } else {
            // Fall back gracefully to calculated highway corridor polyline
            setDirectionsPath(null);
          }
        }
      );
    } catch {
      // In case of any network/API restriction, default polyline remains active
      setDirectionsPath(null);
    }
  }, [map, routesLib, origin.lat, origin.lng, destination.lat, destination.lng, waypoints]);

  // 2. Render dual-layer polylines and fit bounds on the map
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const activePath = directionsPath || defaultPolyline.map(([lat, lng]) => ({ lat, lng }));
    if (activePath.length < 2) return;

    // Clean up previous polylines
    if (casingPolylineRef.current) {
      casingPolylineRef.current.setMap(null);
      casingPolylineRef.current = null;
    }
    if (corePolylineRef.current) {
      corePolylineRef.current.setMap(null);
      corePolylineRef.current = null;
    }

    // Outer casing / shadow line
    casingPolylineRef.current = new google.maps.Polyline({
      path: activePath,
      strokeColor: '#1d4ed8',
      strokeOpacity: 0.75,
      strokeWeight: 9,
      map
    });

    // Inner bright route line
    corePolylineRef.current = new google.maps.Polyline({
      path: activePath,
      strokeColor: '#0284c7',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map
    });

    // Auto-fit bounds to frame all waypoints and the entire route
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
    bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
    waypoints.forEach(w => bounds.extend(new google.maps.LatLng(w.lat, w.lng)));
    activePath.forEach(pt => bounds.extend(new google.maps.LatLng(pt.lat, pt.lng)));
    
    map.fitBounds(bounds, { top: 70, bottom: 70, left: 70, right: 70 });

    return () => {
      if (casingPolylineRef.current) {
        casingPolylineRef.current.setMap(null);
        casingPolylineRef.current = null;
      }
      if (corePolylineRef.current) {
        corePolylineRef.current.setMap(null);
        corePolylineRef.current = null;
      }
    };
  }, [map, directionsPath, defaultPolyline, origin.lat, origin.lng, destination.lat, destination.lng, waypoints]);

  return null;
}
