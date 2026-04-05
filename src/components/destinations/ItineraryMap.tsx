import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ITINERARY_ROUTES, MAP_CONFIG } from '../../utils/mapConstants';

interface ItineraryMapProps {
  destination: string;
  height?: string;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({
  destination,
  height = "500px",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const routes = ITINERARY_ROUTES[destination];
    if (!routes || routes.length === 0) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [routes[0].lat, routes[0].lng],
        8
      );

      L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.attribution,
        maxZoom: MAP_CONFIG.maxZoom,
      }).addTo(map.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    // Add route markers
    const coordinates: [number, number][] = [];
    routes.forEach((route) => {
      coordinates.push([route.lat, route.lng]);

      // Create day marker
      const iconHtml = `
        <div style="
          background: linear-gradient(135deg, #0F766E 0%, #0d5f5b 100%);
          color: white;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          border: 3px solid #FFF4ED;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4);
          cursor: pointer;
        ">
          Day ${route.day}
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [44, 44],
        className: "itinerary-marker",
      });

      const marker = L.marker([route.lat, route.lng], {
        icon,
      })
        .bindPopup(
          `<div>
            <div style="font-weight: bold; color: #0F766E; margin-bottom: 4px;">Day ${route.day}: ${route.location}</div>
            <div style="color: #666; font-size: 12px;">${route.description}</div>
          </div>`,
          { maxWidth: 250 }
        )
        .addTo(map.current!);

      markersRef.current.push(marker);

      // Open popup for Day 1
      if (route.day === 1) {
        marker.openPopup();
      }
    });

    // Draw polyline connecting all points
    if (coordinates.length > 1) {
      polylineRef.current = L.polyline(coordinates, {
        color: "#F97316",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 10",
      }).addTo(map.current!);
    }

    // Fit map to bounds
    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(
        markersRef.current.map((m) => m.getLatLng())
      );
      map.current!.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [destination]);

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
      }}
    />
  );
};
