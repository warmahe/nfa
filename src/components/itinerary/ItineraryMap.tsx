import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ITINERARY_ROUTES, MAP_CONFIG } from '../../utils/mapConstants';

interface ItineraryMapProps {
  destination: string;
  height?: string;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ destination, height = "450px" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const routes = ITINERARY_ROUTES[destination] || [];
    if (routes.length === 0) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: false }).setView([routes[0].lat, routes[0].lng], 8);
      L.tileLayer(MAP_CONFIG.tileLayer).addTo(mapInstance.current);
    }

    // Clear and redraw
    const coords: [number, number][] = [];
    routes.forEach((r) => {
      coords.push([r.lat, r.lng]);
      const icon = L.divIcon({
        className: 'custom-nfa-marker',
        html: `<div style="background:#121212; color:#F4BF4B; border:2px solid #F4BF4B; width:30px; height:30px; border-radius:0; transform:rotate(45deg); display:flex; align-items:center; justify-center; font-weight:bold; font-size:12px;"><span style="transform:rotate(-45deg); display:block; width:100%; text-align:center;">${r.day}</span></div>`,
        iconSize: [30, 30]
      });
      L.marker([r.lat, r.lng], { icon }).addTo(mapInstance.current!).bindPopup(`Day ${r.day}: ${r.location}`);
    });

    L.polyline(coords, { color: "#9E1B1D", weight: 4, dashArray: "10, 10" }).addTo(mapInstance.current!);
    mapInstance.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
  }, [destination]);

  return (
    <div ref={mapRef} className="border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]" style={{ height }} />
  );
};