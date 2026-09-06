"use client";

import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { Truck } from "lucide-react";
import { truckStatusMeta } from "@/lib/content";

const SURABAYA_CENTER = [-7.3, 112.72];

function createTruckIcon(status, isSelected) {
  const meta = truckStatusMeta[status] ?? truckStatusMeta.istirahat;
  const size = isSelected ? 40 : 32;
  const svg = renderToStaticMarkup(
    <Truck color="#ffffff" size={Math.round(size * 0.5)} strokeWidth={2} />
  );
  const html = `<div style="
      width:${size}px;
      height:${size}px;
      background:${meta.markerColor};
      border:2px solid #ffffff;
      border-radius:9999px;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 2px 6px rgba(15,23,42,0.35);
    ">${svg}</div>`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function TruckMap({ trucks, selectedTruckId, onSelectTruck }) {
  // Truk tanpa koordinat (mis. belum ada posisi di Supabase) tidak dipetakan.
  const terpeta = trucks.filter(
    (truck) => Number.isFinite(truck.lat) && Number.isFinite(truck.lng)
  );
  return (
    <MapContainer
      center={SURABAYA_CENTER}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {terpeta.map((truck) => (
        <Marker
          key={truck.id}
          position={[truck.lat, truck.lng]}
          icon={createTruckIcon(truck.status, truck.id === selectedTruckId)}
          eventHandlers={{
            click: () => onSelectTruck(truck.id),
          }}
        />
      ))}
    </MapContainer>
  );
}
