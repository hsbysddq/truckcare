// Helper server-only untuk notifikasi Telegram via Bot API.
// Best-effort: tidak pernah throw, supaya pengaduan tetap tersimpan walau
// Telegram mati. Jangan dipakai di komponen client (token di server saja).
//
// daftarBotAkses diimpor malas (di dalam fungsi) supaya berkas ini tetap bisa
// dimuat node polos untuk verifikasi tanpa runtime Next (lib/supabase.js
// menarik next/cache lewat lib/cache.js).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const OWNER = (process.env.TELEGRAM_CHAT_ID ?? "").trim();

// Murni (tanpa I/O) supaya bisa diuji: node --check / node assert.
export function formatNotifikasiPengaduan({ plat, tanggal, jam, deskripsi }) {
  const laporan = String(deskripsi ?? "").trim().slice(0, 300);
  const waktu = jam ? `${tanggal}, ${String(jam).slice(0, 5)}` : tanggal;
  return [
    "Pengaduan baru masuk",
    `Plat: ${plat}`,
    `Waktu: ${waktu}`,
    `Laporan: ${laporan}`,
    "Buka halaman Pengaduan di dashboard untuk menindaklanjuti.",
  ].join("\n");
}

async function kirimKeChat(token, chatId, teks) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: teks }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.description ?? `Telegram menjawab ${res.status}`);
}

// Kirim ke owner + semua chat di tabel bot_akses (dedup). Kembalikan
// { terkirim, gagal }; nonaktif: true bila token belum dikonfigurasi.
export async function kirimNotifikasiPengaduan(data) {
  if (!TOKEN) return { terkirim: 0, gagal: 0, nonaktif: true };
  let daftar = [];
  try {
    const { daftarBotAkses } = await import("./supabase.js");
    daftar = await daftarBotAkses();
  } catch {
    daftar = [];
  }
  const tujuan = new Set();
  if (OWNER) tujuan.add(OWNER);
  for (const r of daftar ?? []) {
    if (r?.chatId) tujuan.add(String(r.chatId));
  }
  if (!tujuan.size) return { terkirim: 0, gagal: 0 };
  const teks = formatNotifikasiPengaduan(data);
  let terkirim = 0;
  let gagal = 0;
  for (const chatId of tujuan) {
    try {
      await kirimKeChat(TOKEN, chatId, teks);
      terkirim += 1;
    } catch {
      gagal += 1;
    }
  }
  return { terkirim, gagal };
}
