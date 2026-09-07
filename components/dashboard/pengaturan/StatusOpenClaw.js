"use client";

import { useEffect, useState } from "react";
import { pengaturanPage } from "@/lib/content";

export default function StatusOpenClaw() {
  const copy = pengaturanPage.openclawCard;
  const [kondisi, setKondisi] = useState("memeriksa");
  const [host, setHost] = useState(null);
  const [latensi, setLatensi] = useState(null);

  useEffect(() => {
    let batal = false;
    fetch("/api/pengaturan/openclaw", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (batal) return;
        if (!data?.host) {
          setKondisi("kosong");
          return;
        }
        setHost(data.host);
        if (data.ok) {
          setLatensi(data.latencyMs ?? null);
          setKondisi("ok");
        } else {
          setKondisi("gagal");
        }
      })
      .catch(() => {
        if (!batal) setKondisi("gagal");
      });
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{copy.description}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{copy.hostLabel}</dt>
          <dd className="font-mono font-medium text-slate-900">
            {host ?? "-"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Status</dt>
          <dd>
            {kondisi === "memeriksa" && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {copy.memeriksaLabel}
              </span>
            )}
            {kondisi === "ok" && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {copy.terhubungLabel}
              </span>
            )}
            {(kondisi === "gagal" || kondisi === "kosong") && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {copy.terputusLabel}
              </span>
            )}
          </dd>
        </div>
        {kondisi === "ok" && latensi !== null && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">{copy.latencyLabel}</dt>
            <dd className="font-medium text-slate-900">{latensi} ms</dd>
          </div>
        )}
      </dl>

      {kondisi === "kosong" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {copy.belumDikonfigurasi}
        </p>
      )}
    </div>
  );
}