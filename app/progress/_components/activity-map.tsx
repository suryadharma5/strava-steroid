"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// SSR Fix for Leaflet icons using data URIs to avoid missing asset errors
const markerSvg = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16 17 20 13.5 20 9C20 4.5 16.5 1 12 1C7.5 1 4 4.5 4 9C4 13.5 8 17 12 21Z" fill="#ff906d" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
  </svg>
`;

const markerIcon = L.divIcon({
  html: markerSvg,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

interface ActivityMapProps {
  latlngs: [number, number][];
  velocities?: number[];
  cursorIndex?: number | null;
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  map.fitBounds(bounds, { padding: [20, 20] });
  return null;
}

export default function ActivityMap({ latlngs, velocities, cursorIndex }: ActivityMapProps) {
  const segments = useMemo(() => {
    if (!latlngs || latlngs.length < 2) return [];
    if (!velocities || velocities.length < latlngs.length) {
      return [{ positions: latlngs, color: "#ff906d" }];
    }

    const maxSpeed = Math.max(...velocities);
    const minSpeed = Math.min(...velocities);
    const range = maxSpeed - minSpeed || 1;

    const result = [];
    for (let i = 0; i < latlngs.length - 1; i++) {
      const speed = velocities[i];
      const ratio = (speed - minSpeed) / range;
      
      // Color ramp from Red (slow) to Yellow (mid) to Green (fast)
      let color;
      if (ratio < 0.5) {
        // Red to Yellow
        const r = 255;
        const g = Math.round(ratio * 2 * 255);
        color = `rgb(${r}, ${g}, 0)`;
      } else {
        // Yellow to Green
        const r = Math.round((1 - (ratio - 0.5) * 2) * 255);
        const g = 255;
        color = `rgb(${r}, ${g}, 0)`;
      }

      result.push({
        positions: [latlngs[i], latlngs[i + 1]],
        color,
      });
    }
    return result;
  }, [latlngs, velocities]);

  const bounds = useMemo(() => {
    if (!latlngs || latlngs.length === 0) return null;
    return L.latLngBounds(latlngs);
  }, [latlngs]);

  if (!latlngs || latlngs.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-xs text-[#6d6d6d]">
        No map data available
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={latlngs[0]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {segments.map((segment, idx) => (
          <Polyline
            key={idx}
            positions={segment.positions as L.LatLngExpression[]}
            pathOptions={{ color: segment.color, weight: 4, opacity: 0.8 }}
          />
        ))}

        {cursorIndex !== null && cursorIndex !== undefined && latlngs[cursorIndex] && (
          <Marker position={latlngs[cursorIndex]} icon={markerIcon} />
        )}

        {bounds && <ChangeView bounds={bounds} />}
      </MapContainer>
    </div>
  );
}
