"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { analitikPage } from "@/lib/content";

const REGION_CENTER = [-7.45, 112.72];

function createViolationIcon(count) {
  const size = 22 + count * 6;
  const html = `<div style="
      width:${size}px;
      height:${size}px;
      background:rgba(220,38,38,0.8);
      border:2px solid #ffffff;
      border-radius:9999px;
      box-shadow:0 2px 6px rgba(15,23,42,0.35);
    "></div>`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function ViolationMap({ locations }) {
  const copy = analitikPage.charts.violationMap;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={REGION_CENTER}
        zoom={9}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <Marker
            key={location.label}
            position={[location.lat, location.lng]}
            icon={createViolationIcon(location.count)}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {location.label}: {location.count} insiden
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 right-3 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur-sm">
        <p className="font-semibold text-slate-700">{copy.legendLabel}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 flex-none rounded-full bg-red-600/80" />
          <span>Sedikit</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-4 w-4 flex-none rounded-full bg-red-600/80" />
          <span>Banyak</span>
        </div>
      </div>
    </div>
  );
}
