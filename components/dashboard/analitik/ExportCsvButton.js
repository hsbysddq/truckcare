"use client";

import { Download } from "lucide-react";

// Unduh tren pengaduan sebagai CSV langsung dari browser, tanpa server.
export default function ExportCsvButton({ data, filename, label }) {
  function unduh() {
    const baris = ["tanggal,menunggu,tervalidasi,ditolak,perlu_ditinjau"];
    for (const d of data ?? []) {
      baris.push(
        [
          d.date,
          d.menunggu ?? 0,
          d.tervalidasi ?? 0,
          d.ditolak ?? 0,
          d.perluDitinjau ?? 0,
        ].join(",")
      );
    }
    const blob = new Blob([baris.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = filename;
    // Masukkan ke DOM dulu dan revoke di tick berikut: revoke langsung
    // bisa membatalkan unduhan di sebagian browser.
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      onClick={unduh}
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Download className="h-4 w-4 flex-none" strokeWidth={1.75} />
      {label}
    </button>
  );
}