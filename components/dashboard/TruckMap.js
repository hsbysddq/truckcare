"use client";

// Leaflet CSS dimuat di sini (bukan global) supaya tidak ikut semua halaman.
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { truckStatusMeta } from "@/lib/content";

const SURABAYA_CENTER = [-7.3, 112.72];

// SVG truk statis (Lucide Truck), tanpa renderToStaticMarkup bentar pakai ESM.
// Ikon dipakai semua marker; ukuran tampung berubah saat terpilih (40 vs 32).
const SVG_TRUK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.393-.252L13.5 10H11"/><path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M15 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>`;

function createTruckIcon(status, isSelected) {
  const meta = truckStatusMeta[status] ?? truckStatusMeta.istirahat;
  const size = isSelected ? 40 : 32;
  const html = `<div style="width:${size}px;height:${size}px;background:${meta.markerColor};border:2px solid #ffffff;border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(15,23,42,0.35);">${SVG_TRUK}</div>`;

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
