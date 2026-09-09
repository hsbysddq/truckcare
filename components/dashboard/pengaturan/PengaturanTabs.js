"use client";

import { useMemo, useState } from "react";

// Navigasi tab untuk halaman Pengaturan: satu section ditampilkan per waktu,
// supaya admin tidak perlu scroll panjang melewati semua kartu.
export default function PengaturanTabs({ tabs, sections }) {
  const [aktif, setAktif] = useState(tabs[0]?.key ?? "");
  const konten = sections[aktif] ?? null;

  return (
    <div>
      <div
        role="tablist"
        className="sticky top-0 z-30 -mx-1 border-b border-slate-200 bg-white px-1"
      >
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const terpilih = t.key === aktif;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={terpilih}
                onClick={() => setAktif(t.key)}
                className={`flex-none rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  terpilih
                    ? "border-b-2 border-accent bg-accent-tint/40 text-accent"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="pt-6">
        {konten}
      </div>
    </div>
  );
}
