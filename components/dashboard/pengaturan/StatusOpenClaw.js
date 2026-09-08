"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { pengaturanPage } from "@/lib/content";

export default function StatusOpenClaw() {
  const copy = pengaturanPage.openclawCard;
  const [kondisi, setKondisi] = useState("memeriksa");
  const [host, setHost] = useState(null);
  const [latensi, setLatensi] = useState(null);
  const [memeriksaUlang, setMemeriksaUlang] = useState(false);

  const periksa = useCallback(async (batalRef) => {
    setKondisi("memeriksa");
    try {
      const res = await fetch("/api/pengaturan/openclaw", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (batalRef?.current) return;
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
    } catch {
      if (!batalRef?.current) setKondisi("gagal");
    }
  }, []);

  useEffect(() => {
    const batalRef = { current: false };
    periksa(batalRef);
    return () => {
      batalRef.current = true;
    };
  }, [periksa]);

  async function handlePeriksaUlang() {
    if (memeriksaUlang) return;
    setMemeriksaUlang(true);
    await periksa(null);
    setMemeriksaUlang(false);
  }

  const terputus = kondisi === "gagal" || kondisi === "kosong";

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
            {terputus && (
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

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">{copy.modelTitle}</p>
        <p className="mt-1 text-sm text-slate-600">{copy.modelNote}</p>
      </div>

      <button
        type="button"
        onClick={handlePeriksaUlang}
        disabled={memeriksaUlang || kondisi === "memeriksa"}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${memeriksaUlang || kondisi === "memeriksa" ? "animate-spin" : ""}`}
          strokeWidth={1.75}
        />
        {memeriksaUlang || kondisi === "memeriksa"
          ? copy.memeriksaUlangLabel
          : copy.periksaUlangLabel}
      </button>

      {terputus && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {copy.panduanTitle}
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {copy.panduanLangkah.map((langkah) => (
              <li key={langkah}>{langkah}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
