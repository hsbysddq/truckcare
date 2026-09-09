// Format tabel monospace untuk pesan Telegram — Telegram tidak merender
// tabel HTML, jadi pakai blok <pre> dengan kolom rata padding spasi.
// Dua varian: polos (fallback saat parse HTML gagal) dan HTML (kolom Peta
// jadi link Google Maps yang bisa diklik).
// Murni (tanpa side effect) supaya bisa diuji: node --test / node assert.
const LEBAR = { truk: 8, plat: 11, status: 8, tujuan: 11, kec: 9, peta: 14 };

export const URL_MAPS = (lat, lon) => `https://www.google.com/maps?q=${lat},${lon}`;
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

function koordinat(b) {
  if (b?.lat == null || b?.lon == null) return "-";
  return `${Number(b.lat).toFixed(3)},${Number(b.lon).toFixed(3)}`;
}

function kepala() {
  return (
    `${sel("Truk", LEBAR.truk)} ${sel("Plat", LEBAR.plat)} ` +
    `${sel("Status", LEBAR.status)} ${sel("Tujuan", LEBAR.tujuan)} ` +
    `${sel("Kecepatan", LEBAR.kec, "kanan")} ${sel("Peta", LEBAR.peta)}`
  );
}

const garis = (k) => "-".repeat(k.length);

const nilaiKec = (kec) => (kec != null ? `${kec} km/j` : "-");

// baris: [{ nama, plat, status, tujuan, kec, lat, lon }] → string tabel polos.
// Kolom Peta berisi koordinat agar tetap berguna walau tak bisa diklik.
export function formatTabelArmada(baris) {
  const k = kepala();
  const isi = (baris ?? []).map(
    (b) =>
      `${sel(b.nama, LEBAR.truk)} ${sel(b.plat, LEBAR.plat)} ` +
      `${sel(b.status, LEBAR.status)} ${sel(b.tujuan, LEBAR.tujuan)} ` +
      `${sel(nilaiKec(b.kec), LEBAR.kec, "kanan")} ${sel(koordinat(b), LEBAR.peta)}`
  );
  return [k, garis(k), ...isi].join("\n");
}

// Versi HTML: teks sel di-escape, kolom Peta jadi link yang bisa diklik.
// Padding dihitung dari teks asli supaya kolom tetap rata di render monospace.
export function formatTabelArmadaHtml(baris) {
  const k = kepala();
  const isi = (baris ?? []).map((b) => {
    const link =
      b?.lat != null && b?.lon != null
        ? `<a href="${URL_MAPS(b.lat, b.lon)}">${escapeHtml(sel("buka", LEBAR.peta))}</a>`
        : escapeHtml(sel("-", LEBAR.peta));
    return (
      `${escapeHtml(sel(b?.nama, LEBAR.truk))} ${escapeHtml(sel(b?.plat, LEBAR.plat))} ` +
      `${escapeHtml(sel(b?.status, LEBAR.status))} ${escapeHtml(sel(b?.tujuan, LEBAR.tujuan))} ` +
      `${escapeHtml(sel(nilaiKec(b?.kec), LEBAR.kec, "kanan"))} ${link}`
    );
  });
  return [k, garis(k), ...isi].join("\n");
}

// Kolom lebar untuk daftar pengaduan yang menunggu validasi.
const LEBAR_P = { plat: 12, tanggal: 11, jam: 6, deskripsi: 42 };

// baris: [{ plat, tanggal, jam, deskripsi }] → string tabel polos.
export function formatTabelPengaduan(baris) {
  const kepala =
    `${sel("Plat", LEBAR_P.plat)} ${sel("Tanggal", LEBAR_P.tanggal)} ` +
    `${sel("Jam", LEBAR_P.jam)} ${sel("Deskripsi", LEBAR_P.deskripsi)}`;
  const garis = "-".repeat(kepala.length);
  const isi = (baris ?? []).map(
    (b) =>
      `${sel(b.plat, LEBAR_P.plat)} ${sel(b.tanggal, LEBAR_P.tanggal)} ` +
      `${sel(b.jam ?? "-", LEBAR_P.jam)} ${sel(b.deskripsi ?? "-", LEBAR_P.deskripsi)}`
  );
  return [kepala, garis, ...isi].join("\n");
}

// Versi HTML (dalam <pre>) untuk daftar pengaduan; teks sel di-escape.
export function formatTabelPengaduanHtml(baris) {
  const kepala =
    `${sel("Plat", LEBAR_P.plat)} ${sel("Tanggal", LEBAR_P.tanggal)} ` +
    `${sel("Jam", LEBAR_P.jam)} ${sel("Deskripsi", LEBAR_P.deskripsi)}`;
  const garis = "-".repeat(kepala.length);
  const isi = (baris ?? []).map((b) => {
    const selE = (v, lb) => escapeHtml(sel(String(v ?? "-"), lb));
    return (
      `${selE(b.plat, LEBAR_P.plat)} ${selE(b.tanggal, LEBAR_P.tanggal)} ` +
      `${selE(b.jam, LEBAR_P.jam)} ${selE(b.deskripsi, LEBAR_P.deskripsi)}`
    );
  });
  return [kepala, garis, ...isi].join("\n");
}
