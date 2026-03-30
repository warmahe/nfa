import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DESTINATION_LOCATIONS, MAP_CONFIG } from "../utils/mapConstants";

interface DestinationMapProps {
  selectedDestination?: string;
  onDestinationSelect?: (destinationKey: string, destinationName: string) => void;
  height?: string;
}

export const DestinationMap: React.FC<DestinationMapProps> = ({
  selectedDestination,
  onDestinationSelect,
  height = "500px",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [20, 0],
        MAP_CONFIG.defaultZoom
      );

      L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.attribution,
        maxZoom: MAP_CONFIG.maxZoom,
      }).addTo(map.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add destination markers
    Object.entries(DESTINATION_LOCATIONS).forEach(([key, location]) => {
      const isSelected = selectedDestination === key;

      // Create custom icon
      const iconColor = isSelected ? "#F97316" : "#0F766E";
      const iconHtml = `
        <div style="
          background-color: ${iconColor};
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s;
        ">
          📍
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [40, 40],
        className: "destination-marker",
      });

      const marker = L.marker([location.lat, location.lng], {
        icon,
      })
        .bindPopup(
          `<div style="font-weight: bold; color: #0F766E;">${location.name}</div>`,
          { maxWidth: 200 }
        )
        .addTo(map.current!);

      // Add click handler for marker selection
      marker.on("click", () => {
        onDestinationSelect?.(key, location.name);
      });

      markersRef.current.push(marker);

      // Pan to selected destination
      if (isSelected) {
        map.current!.setView([location.lat, location.lng], location.zoom);
        marker.openPopup();
      }
    });
  }, [selectedDestination, onDestinationSelect]);

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
