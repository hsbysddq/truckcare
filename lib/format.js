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

export function isValidPlate(input) {
  return PLATE_PATTERN.test(normalizePlate(input));
}
