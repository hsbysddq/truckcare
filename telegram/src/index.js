// Telegram bot Antar — owner bisa tanya status armada langsung dari HP.
// Polling mode (tanpa webhook) supaya gampang jalan di VPS.
import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { formatTabelArmada, formatTabelArmadaHtml } from './tabel.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
// Chat ID owner bootstrap: selalu boleh, anti-lockout kalau tabel
// bot_akses belum dibuat atau gagal dibaca.
const ownerChat = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error('Isi TELEGRAM_BOT_TOKEN di telegram/.env');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di telegram/.env');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const bot = new TelegramBot(token, { polling: true });

// Reply keyboard: tombol permanen di bawah kolom ketik supaya owner cukup
// ketuk, tidak perlu mengetik /status. Keyboard menetap di client sampai
// diganti, jadi cukup dikirim di /start dan tiap balasan penting.
const TOMBOL_STATUS = "Status Armada";
const TOMBOL_REKAP = "Rekap Hari Ini";
const TOMBOL_TUNGGU = "Pengaduan Menunggu";
const KEYBOARD = {
  keyboard: [[{ text: TOMBOL_STATUS }, { text: TOMBOL_REKAP }], [{ text: TOMBOL_TUNGGU }]],
  resize_keyboard: true,
};

// Daftarkan ke menu perintah "/" supaya rapi (best-effort, abaikan gagal).
bot
  .setMyCommands([
    { command: "start", description: "Tampilkan tombol menu" },
    { command: "status", description: "Lihat posisi armada" },
    { command: "rekap", description: "Ringkasan pengaduan hari ini" },
    { command: "pending", description: "Pengaduan yang menunggu validasi" },
  ])
  .catch((e) => console.error("setMyCommands gagal:", e.message));

// Batas gerak sama dengan web (lib/supabase.js statusDariPosisi): di atas
// 5 km/jam = jalan. Label dipertahankan gaya bot (jalan/berhenti).
function jalanDariKecepatan(kecepatan) {
  return Number(kecepatan ?? 0) > 5 ? 'jalan' : 'berhenti';
}

async function statusArmada() {
  // Limit + pilihan trip disamakan dengan web (getTrucksShape) supaya
  // angka bot dan peta selalu dari baris yang sama.
  const { data: posisi, error: errPosisi } = await supabase
    .from('positions')
    .select('*')
    .order('ts', { ascending: false })
    .limit(200);
  if (errPosisi) throw errPosisi;
  const { data: trips } = await supabase
    .from('trips')
    .select('truk_id,tujuan,mulai')
    .eq('status', 'berjalan')
    .order('mulai', { ascending: false })
    .limit(200);
  const { data: trucks } = await supabase.from('trucks').select('*');

  const byTruk = new Map((trucks ?? []).map((t) => [t.id, t]));
  const tripAktif = new Map();
  for (const t of trips ?? []) {
    if (t && !tripAktif.has(t.truk_id)) tripAktif.set(t.truk_id, t);
  }
  const seen = new Set();
  const baris = [];
  for (const p of posisi ?? []) {
    if (seen.has(p.truk_id)) continue;
    seen.add(p.truk_id);
    const truk = byTruk.get(p.truk_id);
    const trip = tripAktif.get(p.truk_id);
    if (!truk) continue;
    baris.push({
      nama: truk.nama,
      plat: truk.plat,
      status: jalanDariKecepatan(p.kecepatan),
      tujuan: trip?.tujuan ?? '?',
      kec: String(Number(p.kecepatan ?? 0).toFixed(0)),
      lat: p.lat,
      lon: p.lon,
    });
  }
  // { html, teks }: kirim html (blok <pre> rapi); kalau parse gagal,
  // fallback teks polos supaya data tetap sampai.
  const tabelHtml = formatTabelArmadaHtml(baris);
  const tabelTeks = formatTabelArmada(baris);
  return baris.length
    ? {
        html: `Status armada:\n<pre>${tabelHtml}</pre>`,
        teks: `Status armada:\n${tabelTeks}`,
      }
    : { html: 'Belum ada data posisi.', teks: 'Belum ada data posisi.' };
}

async function rekapHariIni() {
  const hariIni = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.from('pengaduan').select('status').eq('tanggal', hariIni);
  if (error) throw error;
  const total = data?.length ?? 0;
  const hitung = (s) => data?.filter((p) => p.status === s).length ?? 0;
  let pesan = `Ringkasan pengaduan hari ini (${hariIni}):\n`;
  pesan += `• Total: ${total}\n`;
  pesan += `• Valid: ${hitung('valid')}\n`;
  pesan += `• Ditolak AI: ${hitung('ditolak')}\n`;
  pesan += `• Menunggu: ${hitung('menunggu')}`;
  return pesan;
}

async function pengaduanMenunggu() {
  const { data, error } = await supabase
    .from('pengaduan')
    .select('plat,tanggal,jam,deskripsi')
    .eq('status', 'menunggu')
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  if (!data?.length) return 'Tidak ada pengaduan yang menunggu validasi.';
  const baris = data.map(
    (p) => `• ${p.plat} (${p.tanggal}${p.jam ? ` ${p.jam}` : ''}): ${(p.deskripsi ?? '').slice(0, 80)}`
  );
  return `Menunggu validasi (${data.length}):\n${baris.join('\n')}`;
}

// Boleh akses kalau owner bootstrap atau chat_id terdaftar di tabel
// bot_akses (dikelola dari dashboard Pengaturan). Tabel belum ada /
// gagal dibaca = tolak (fail-closed), kecuali owner.
async function bolehAkses(chatId) {
  const id = String(chatId);
  if (ownerChat && id === String(ownerChat)) return true;
  try {
    const { data, error } = await supabase
      .from('bot_akses')
      .select('id')
      .eq('chat_id', id)
      .limit(1);
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  } catch (e) {
    console.error('cek akses gagal:', e.message);
    return false;
  }
}

bot.onText(/\/start/, async (msg) => {
  // Catat chat ID pendaftar baru di log service supaya owner bisa
  // menyalinnya ke dashboard Pengaturan (journalctl -u antar-telegram).
  console.log(`start dari chat_id=${msg.chat.id} nama=${msg.from?.first_name ?? "-"} username=${msg.from?.username ?? "-"}`);
  if (!(await bolehAkses(msg.chat.id))) return;
  try {
    await bot.sendMessage(
      msg.chat.id,
      "Halo, saya bot Antar. Ketuk tombol di bawah untuk lihat posisi armada.",
      { reply_markup: KEYBOARD }
    );
  } catch (e) {
    console.error(e);
  }
});

bot.onText(new RegExp(`^(\\/status|${TOMBOL_STATUS})$`), async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  try {
    const pesan = await statusArmada();
    try {
      await bot.sendMessage(msg.chat.id, pesan.html, {
        parse_mode: 'HTML',
        reply_markup: KEYBOARD,
      });
    } catch {
      await bot.sendMessage(msg.chat.id, pesan.teks, {
        reply_markup: KEYBOARD,
      });
    }
  } catch (e) {
    console.error(e);
    await bot.sendMessage(msg.chat.id, "Gagal mengambil status.");
  }
});

bot.onText(new RegExp(`^(\\/rekap|${TOMBOL_REKAP})$`), async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  try {
    await bot.sendMessage(msg.chat.id, await rekapHariIni(), {
      reply_markup: KEYBOARD,
    });
  } catch (e) {
    console.error(e);
    await bot.sendMessage(msg.chat.id, "Gagal mengambil rekap.");
  }
});

bot.onText(new RegExp(`^(\\/pending|${TOMBOL_TUNGGU})$`), async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  try {
    await bot.sendMessage(msg.chat.id, await pengaduanMenunggu(), {
      reply_markup: KEYBOARD,
    });
  } catch (e) {
    console.error(e);
    await bot.sendMessage(msg.chat.id, "Gagal mengambil daftar tunggu.");
  }
});

bot.on("message", async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  const teks = (msg.text || "").trim();
  const tombol = [TOMBOL_STATUS, TOMBOL_REKAP, TOMBOL_TUNGGU];
  if (!teks || teks.startsWith("/") || tombol.includes(teks)) return;
  // Pertanyaan bebas: arahkan ke tombol, bukan ke perintah ketik
  try {
    await bot.sendMessage(
      msg.chat.id,
      "Ketuk salah satu tombol di bawah untuk lihat data armada.",
      { reply_markup: KEYBOARD }
    );
  } catch (e) {
    console.error(e);
  }
});

console.log("Bot Antar jalan (polling). Kirim /start di Telegram.");
