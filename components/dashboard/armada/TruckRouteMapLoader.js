"use client";

import dynamic from "next/dynamic";

// Leaflet butuh window; muat hanya di client (server component tidak boleh
// pakai ssr:false langsung).
const TruckRouteMap = dynamic(
  () => import("@/components/dashboard/armada/TruckRouteMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Memuat peta...
      </div>
    ),
  }
);

export default function TruckRouteMapLoader(props) {
  return <TruckRouteMap {...props} />;
}
