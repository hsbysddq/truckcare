// Pemformatan tampilan yang dipakai lintas halaman.

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Nomor tiket pendek untuk tampilan: "#RPT-043803" dari 6 karakter pertama
// UUID. UUID penuh tetap dipakai sebagai kunci dan parameter URL.
export function formatTicketId(id) {
  if (!id) return "-";
  const value = String(id);
  if (UUID_PATTERN.test(value)) return `#RPT-${value.slice(0, 6).toUpperCase()}`;
  if (/^RPT-/i.test(value)) return `#${value.toUpperCase()}`;
  return `#RPT-${value.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`;
}

// Plat nomor Indonesia: 1–2 huruf, spasi, 1–4 angka, spasi, 1–3 huruf.
export const PLATE_PATTERN = /^[A-Z]{1,2} \d{1,4} [A-Z]{1,3}$/;

// Rapikan input pengguna sebelum divalidasi/disimpan: huruf kapital, satu
// spasi antar bagian ("l  9042cd" tidak lolos — pemisah harus ada).
export function normalizePlate(input) {
  return String(input ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

// Kunci tanggal lokal (YYYY-MM-DD) dari teks waktu kejadian pengaduan:
// "2026-09-05, 09:40" (Supabase) atau "5 September 2026, 09:40" (data contoh).
const BULAN_ID = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7,
  agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};
export function incidentDateKey(incidentAt) {
  if (!incidentAt) return null;
  const s = String(incidentAt);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const id = s.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (id && BULAN_ID[id[2].toLowerCase()]) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${id[3]}-${pad(BULAN_ID[id[2].toLowerCase()])}-${pad(id[1])}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isValidPlate(input) {
  return PLATE_PATTERN.test(normalizePlate(input));
}

// Kunci pencocokan: huruf kapital tanpa spasi sama sekali, sehingga
// "l8821ab", "L 8821 AB", dan "L8821 AB" menghasilkan kunci yang sama.
export function plateKey(input) {
  return String(input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Format otomatis saat mengetik: buang karakter selain huruf/angka, huruf
// kapital, lalu sisipkan spasi mengikuti pola plat Indonesia
// (1-2 huruf, 1-4 angka, 1-3 huruf). Karakter di luar pola diabaikan.
export function formatPlateInput(raw) {
  const clean = plateKey(raw);
  const m = clean.match(/^([A-Z]{0,2})(\d{0,4})([A-Z]{0,3})/);
  if (!m) return "";
  return [m[1], m[2], m[3]].filter(Boolean).join(" ");
}
