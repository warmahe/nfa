import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { Package } from "../../types/database";
import { MAP_CONFIG } from "../../utils/mapConstants";

interface DestinationMapProps {
  packages: Package[];
  height?: string;
}

export const DestinationMap: React.FC<DestinationMapProps> = ({
  packages,
  height = "600px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Fallback coordinates for known destinations
  const DESTINATION_COORDS: Record<string, [number, number]> = {
    "Iceland": [64.9631, -19.0208],
    "Norway": [60.4720, 8.4689],
    "Sweden": [60.1282, 18.6435],
    "Finland": [61.9241, 25.7482],
    "Japan": [36.2048, 138.2529],
    "Nepal": [28.3949, 84.1240],
    "India": [20.5937, 78.9629],
    "Peru": [-9.1899, -75.0152],
    "Patagonia": [-51.6230, -69.2168],
    "Chile": [-35.6751, -71.5430],
    "Morocco": [31.7917, -7.0926],
    "Kenya": [-0.0236, 37.9062],
    "Tanzania": [-6.3690, 34.8888],
    "Bali": [-8.3405, 115.0920],
    "Thailand": [15.8700, 100.9925],
    "New Zealand": [-40.9006, 174.8860],
    "Greenland": [71.7069, -42.6043],
    "Svalbard": [77.8750, 20.9752],
    "Mongolia": [46.8625, 103.8467],
    "Bhutan": [27.5142, 90.4336],
  };

  const getCoords = (pkg: Package): [number, number] | null => {
    // Try destinations array
    if (pkg.destinations?.length) {
      for (const dest of pkg.destinations) {
        const coords = DESTINATION_COORDS[dest];
        if (coords) return coords;
        // Partial match
        const key = Object.keys(DESTINATION_COORDS).find(k =>
          dest.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(dest.toLowerCase())
        );
        if (key) return DESTINATION_COORDS[key];
      }
    }
    return null;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Init map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([20, 10], 2);

      L.tileLayer(MAP_CONFIG?.tileLayer || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapInstance.current);
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds: [number, number][] = [];

    packages.forEach((pkg) => {
      const coords = getCoords(pkg);
      if (!coords) return;

      bounds.push(coords);

      const price = pkg.pricing?.basePrice
        ? `₹${pkg.pricing.basePrice.toLocaleString()}`
        : "—";

      const icon = L.divIcon({
        className: "nfa-map-marker",
        html: `
          <div style="
            background:#121212; 
            color:#F4BF4B; 
            border:2px solid #F4BF4B; 
            width:36px; height:36px; 
            transform:rotate(45deg); 
            display:flex; align-items:center; justify-content:center;
            font-weight:900; font-size:10px;
            font-family:'Poppins',sans-serif;
            box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
            cursor:pointer;
          ">
            <span style="transform:rotate(-45deg); line-height:1;">✦</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(coords, { icon })
        .addTo(mapInstance.current!)
        .bindPopup(
          `<div style="font-family:'Poppins',sans-serif; min-width:200px;">
            <img src="${pkg.media?.thumbnail || ''}" style="width:100%; height:100px; object-fit:cover; border:2px solid #121212; margin-bottom:8px;" />
            <div style="font-weight:900; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:#121212;">${pkg.title}</div>
            <div style="font-size:10px; font-weight:700; color:#9E1B1D; margin-top:4px; text-transform:uppercase; letter-spacing:0.1em;">${pkg.destinations?.[0] || ''} • ${pkg.duration || ''}</div>
            <div style="font-size:12px; font-weight:900; color:#121212; margin-top:6px;">${price}</div>
          </div>`,
          { maxWidth: 240, className: "nfa-popup" }
        )
        .on("click", () => setSelectedPkg(pkg));

      markersRef.current.push(marker);
    });

    if (bounds.length > 0 && mapInstance.current) {
      if (bounds.length === 1) {
        mapInstance.current.setView(bounds[0], 7);
      } else {
        mapInstance.current.fitBounds(L.latLngBounds(bounds as L.LatLngBoundsLiteral), {
          padding: [60, 60],
          maxZoom: 8,
        });
      }
    }
  }, [packages]);

  return (
    <div className="relative w-full">
      <div
        ref={mapRef}
        className="border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]"
        style={{ height }}
      />

      {/* Selected Package Card */}
      {selectedPkg && (
        <div className="absolute bottom-6 left-6 z-[500] w-72 bg-white border-[3px] border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B]">
          <div className="relative aspect-video border-b-[3px] border-[#121212] overflow-hidden">
            <img
              src={selectedPkg.media?.thumbnail}
              className="w-full h-full object-cover"
              alt={selectedPkg.title}
            />
            <button
              onClick={() => setSelectedPkg(null)}
              className="absolute top-2 right-2 size-6 bg-[#121212] text-white flex items-center justify-center hover:bg-[#9E1B1D]"
            >
              <X size={12} />
            </button>
          </div>
          <div className="p-4">
            <h4 className="font-brand font-black text-xl uppercase tracking-tight mb-1">{selectedPkg.title}</h4>
            <p className="font-black text-[9px] uppercase tracking-widest text-[#9E1B1D] mb-3">
              {selectedPkg.destinations?.[0]} • {selectedPkg.duration}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-[#121212]">
                {selectedPkg.pricing?.basePrice ? `₹${selectedPkg.pricing.basePrice.toLocaleString()}` : 'Contact'}
              </span>
              <Link
                to={`/itinerary/${selectedPkg.slug || selectedPkg.id}`}
                className="flex items-center gap-1 bg-[#121212] text-[#F4BF4B] px-4 py-2 font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors"
              >
                View <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nfa-popup .leaflet-popup-content-wrapper {
          border: 3px solid #121212;
          border-radius: 0;
          box-shadow: 6px 6px 0 #121212;
          padding: 0;
        }
        .nfa-popup .leaflet-popup-content { margin: 0; padding: 12px; }
        .nfa-popup .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
};
