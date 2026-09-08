// Format tabel monospace untuk pesan Telegram — Telegram tidak merender
// tabel HTML, jadi pakai blok <pre> dengan kolom rata padding spasi.
// Murni (tanpa side effect) supaya bisa diuji: node --test / node assert.
const LEBAR = { truk: 8, plat: 11, status: 8, tujuan: 11, kec: 3 };

function sel(teks, lebar, rata = "kiri") {
  const t = String(teks ?? "-");
  const potong = t.length > lebar ? t.slice(0, lebar) : t;
  return rata === "kanan" ? potong.padStart(lebar, " ") : potong.padEnd(lebar, " ");
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// baris: [{ nama, plat, status, tujuan, kec }] → string tabel polos.
export function formatTabelArmada(baris) {
  const kepala =
    `${sel("Truk", LEBAR.truk)} ${sel("Plat", LEBAR.plat)} ` +
    `${sel("Status", LEBAR.status)} ${sel("Tujuan", LEBAR.tujuan)} ${sel("Kec", LEBAR.kec, "kanan")}`;
  const garis = "-".repeat(kepala.length);
  const isi = (baris ?? []).map(
    (b) =>
      `${sel(b.nama, LEBAR.truk)} ${sel(b.plat, LEBAR.plat)} ` +
      `${sel(b.status, LEBAR.status)} ${sel(b.tujuan, LEBAR.tujuan)} ${sel(b.kec, LEBAR.kec, "kanan")}`
  );
  return [kepala, garis, ...isi].join("\n");
}
