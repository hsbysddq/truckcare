"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { truckDetailPage } from "@/lib/content";
import { createTruckIcon } from "@/components/dashboard/TruckMap";

const FALLBACK_CENTER = [-7.45, 112.72];

function FitRoute({ points }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 0) return undefined;
    // Tunggu container siap; skip bila luasan 0 (tab/modal tersembunyi).
    const el = map.getContainer();
    if (!el || el.clientWidth === 0 || el.clientHeight === 0) return undefined;
    const raf = requestAnimationFrame(() => {
      map.invalidateSize();
      if (points.length === 1) {
        map.setView(points[0], 13);
        return;
      }
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function TruckRouteMap({ routePath, position, status }) {
  const copy = truckDetailPage.map;
  const points = routePath.map((p) => [p.lat, p.lng]);
  const hasPosition =
    position && Number.isFinite(position.lat) && Number.isFinite(position.lng);
  const allPoints = hasPosition
    ? [...points, [position.lat, position.lng]]
    : points;
  const start = points[0];
  const end = points[points.length - 1];

  return (
    <MapContainer
      center={allPoints[0] ?? FALLBACK_CENTER}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoute points={allPoints} />
      {points.length > 1 && (
        <Polyline
          positions={points}
          pathOptions={{ color: "#1b4f9c", weight: 4, opacity: 0.85 }}
        />
      )}
      {start && (
        <CircleMarker
          center={start}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#1b4f9c", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            {copy.startLabel}: {routePath[0].label}
          </Tooltip>
        </CircleMarker>
      )}
      {end && points.length > 1 && (
        <CircleMarker
          center={end}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#f4711f", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            {copy.endLabel}: {routePath[routePath.length - 1].label}
          </Tooltip>
        </CircleMarker>
      )}
      {hasPosition && (
        <Marker
          position={[position.lat, position.lng]}
          icon={createTruckIcon(status, true)}
        >
          <Tooltip direction="top" offset={[0, -22]}>
            {copy.currentLabel}
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
