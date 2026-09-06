"use client";

import dynamic from "next/dynamic";

const ViolationMap = dynamic(
  () => import("@/components/dashboard/analitik/ViolationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
        Memuat peta...
      </div>
    ),
  }
);

export default function ViolationMapLoader(props) {
  return <ViolationMap {...props} />;
}
