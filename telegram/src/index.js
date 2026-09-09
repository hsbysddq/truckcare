// Telegram bot Antar — owner bisa tanya status armada langsung dari HP.
// Polling mode (tanpa webhook) supaya gampang jalan di VPS.
import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { formatTabelArmada, formatTabelArmadaHtml, formatTabelPengaduan, formatTabelPengaduanHtml } from './tabel.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerChat = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'FATAL', msg: 'Isi TELEGRAM_BOT_TOKEN di telegram/.env' }));
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'FATAL', msg: 'Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di telegram/.env' }));
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));
}

// Rate limiting: max N request per menit per chat ID. Pemilik (TELEGRAM_CHAT_ID)
// tidak pernah dibatasi — dia orang yang paling sering bertanya dan paling
// dipercaya; limit hanya menahan chat yang memborbardir.
const RATE_LIMIT = parseInt(process.env.TELEGRAM_RATE_LIMIT || '30', 10);
const RATE_WINDOW_MS = 60_000;
const rateBuckets = new Map();

function isRateLimited(chatId) {
  if (ownerChat && String(chatId) === String(ownerChat)) return false;
  const now = Date.now();
  const bucket = rateBuckets.get(chatId);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    rateBuckets.set(chatId, { start: now, count: 1 });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

const bot = new TelegramBot(token, { polling: true });

// Inline keyboard: lebih fleksibel dari reply keyboard (bisa update per-message)
const INLINE_KEYBOARD = {
  inline_keyboard: [
    [{ text: 'Status Armada', callback_data: 'status' }],
    [{ text: 'Rekap Hari Ini', callback_data: 'rekap' }],
    [{ text: 'Pengaduan Menunggu', callback_data: 'pending' }],
  ],
};

bot.setMyCommands([
  { command: 'start', description: 'Tampilkan tombol menu' },
  { command: 'status', description: 'Lihat posisi armada' },
  { command: 'rekap', description: 'Ringkasan pengaduan hari ini' },
  { command: 'pending', description: 'Pengaduan yang menunggu validasi' },
  { command: 'detail', description: 'Detail satu truk (contoh: /detail 4)' },
]).catch((e) => log('ERROR', 'setMyCommands gagal', { error: e.message }));

function jalanDariKecepatan(kecepatan) {
  return Number(kecepatan ?? 0) > 5 ? 'jalan' : 'berhenti';
}

async function statusArmada() {
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
  const tabelHtml = formatTabelArmadaHtml(baris);
  const tabelTeks = formatTabelArmada(baris);
  return baris.length
    ? { html: `Status armada:\n<pre>${tabelHtml}</pre>`, teks: `Status armada:\n${tabelTeks}` }
    : { html: 'Belum ada data posisi.', teks: 'Belum ada data posisi.' };
}

async function detailTruk(nomor) {
  const { data: trucks } = await supabase.from('trucks').select('*');
  const truk = (trucks ?? []).find((t) => t.nama?.toLowerCase() === `truk ${nomor}`);
  if (!truk) return `Truk ${nomor} tidak ditemukan.`;

  const { data: posisi } = await supabase
    .from('positions')
    .select('*')
    .eq('truk_id', truk.id)
    .order('ts', { ascending: false })
    .limit(1);
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('truk_id', truk.id)
    .eq('status', 'berjalan')
    .order('mulai', { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: driver } = truk.driver_id
    ? await supabase.from('drivers').select('nama,telepon').eq('id', truk.driver_id).maybeSingle()
    : { data: null };

  const p = posisi?.[0];
  const lines = [`Detail Truk ${nomor}:`, `Plat: ${truk.plat}`];
  if (driver?.nama) lines.push(`Driver: ${driver.nama}${driver.telepon ? ` (${driver.telepon})` : ''}`);
  if (p) {
    lines.push(`Status: ${jalanDariKecepatan(p.kecepatan)} (${p.kecepatan ?? 0} km/jam)`);
    if (p.lat && p.lon) lines.push(`Posisi: ${Number(p.lat).toFixed(4)}, ${Number(p.lon).toFixed(4)}`);
  } else {
    lines.push('Status: tidak ada data posisi');
  }
  if (trip) {
    lines.push(`Tujuan: ${trip.tujuan ?? '?'}`);
    if (trip.mulai) lines.push(`Mulai: ${trip.mulai}`);
  }
  return lines.join('\n');
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
  if (!data?.length) return { html: 'Tidak ada pengaduan yang menunggu validasi.', teks: 'Tidak ada pengaduan yang menunggu validasi.' };
  const baris = data.map((p) => ({
    plat: p.plat,
    tanggal: p.tanggal,
    jam: p.jam ?? '-',
    deskripsi: (p.deskripsi ?? '').slice(0, 42),
  }));
  return {
    html: `Menunggu validasi (${data.length}):\n<pre>${formatTabelPengaduanHtml(baris)}</pre>`,
    teks: `Menunggu validasi (${data.length}):\n${formatTabelPengaduan(baris)}`,
  };
}

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
    log('ERROR', 'cek akses gagal', { error: e.message });
    return false;
  }
}

async function kirimBalasan(chatId, html, teks) {
  try {
    await bot.sendMessage(chatId, html, { parse_mode: 'HTML', reply_markup: INLINE_KEYBOARD });
  } catch {
    await bot.sendMessage(chatId, teks, { reply_markup: INLINE_KEYBOARD });
  }
}

bot.onText(/\/start/, async (msg) => {
  log('INFO', 'start', { chat_id: msg.chat.id, nama: msg.from?.first_name, username: msg.from?.username });
  if (!(await bolehAkses(msg.chat.id))) return;
  try {
    await bot.sendMessage(msg.chat.id, 'Halo, saya bot Antar. Ketuk tombol di bawah untuk lihat data armada.', { reply_markup: INLINE_KEYBOARD });
  } catch (e) {
    log('ERROR', 'gagal kirim start', { error: e.message });
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId) return;
  if (isRateLimited(chatId)) {
    await bot.answerCallbackQuery(query.id, { text: 'Terlalu banyak permintaan, coba lagi nanti.' });
    return;
  }
  if (!(await bolehAkses(chatId))) {
    await bot.answerCallbackQuery(query.id, { text: 'Akses ditolak.' });
    return;
  }
  const data = query.data;
  try {
    if (data === 'status') {
      const pesan = await statusArmada();
      await kirimBalasan(chatId, pesan.html, pesan.teks);
    } else if (data === 'rekap') {
      await bot.sendMessage(chatId, await rekapHariIni(), { reply_markup: INLINE_KEYBOARD });
    } else if (data === 'pending') {
      const pesan = await pengaduanMenunggu();
      await kirimBalasan(chatId, pesan.html, pesan.teks);
    }
    await bot.answerCallbackQuery(query.id);
  } catch (e) {
    log('ERROR', 'callback_query gagal', { data, error: e.message });
    await bot.answerCallbackQuery(query.id, { text: 'Terjadi kesalahan.' });
  }
});

bot.onText(/\/status/, async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  if (isRateLimited(msg.chat.id)) return;
  try {
    const pesan = await statusArmada();
    await kirimBalasan(msg.chat.id, pesan.html, pesan.teks);
  } catch (e) {
    log('ERROR', 'status gagal', { error: e.message });
    await bot.sendMessage(msg.chat.id, 'Gagal mengambil status.', { reply_markup: INLINE_KEYBOARD });
  }
});

bot.onText(/\/rekap/, async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  if (isRateLimited(msg.chat.id)) return;
  try {
    await bot.sendMessage(msg.chat.id, await rekapHariIni(), { reply_markup: INLINE_KEYBOARD });
  } catch (e) {
    log('ERROR', 'rekap gagal', { error: e.message });
    await bot.sendMessage(msg.chat.id, 'Gagal mengambil rekap.', { reply_markup: INLINE_KEYBOARD });
  }
});

bot.onText(/\/pending/, async (msg) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  if (isRateLimited(msg.chat.id)) return;
  try {
    const pesan = await pengaduanMenunggu();
    await kirimBalasan(msg.chat.id, pesan.html, pesan.teks);
  } catch (e) {
    log('ERROR', 'pending gagal', { error: e.message });
    await bot.sendMessage(msg.chat.id, 'Gagal mengambil daftar tunggu.', { reply_markup: INLINE_KEYBOARD });
  }
});

bot.onText(/\/detail\s+(\d+)/, async (msg, match) => {
  if (!(await bolehAkses(msg.chat.id))) return;
  if (isRateLimited(msg.chat.id)) return;
  const nomor = parseInt(match[1], 10);
  if (nomor < 1 || nomor > 99) {
    await bot.sendMessage(msg.chat.id, 'Nomor truk harus 1-99.', { reply_markup: INLINE_KEYBOARD });
    return;
  }
  try {
    const pesan = await detailTruk(nomor);
    await bot.sendMessage(msg.chat.id, pesan, { reply_markup: INLINE_KEYBOARD });
  } catch (e) {
    log('ERROR', 'detail gagal', { nomor, error: e.message });
    await bot.sendMessage(msg.chat.id, 'Gagal mengambil detail truk.', { reply_markup: INLINE_KEYBOARD });
  }
});

function shutdown(sig) {
  log('INFO', 'shutdown dimulai', { signal: sig });
  bot.stopPolling();
  setTimeout(() => {
    log('INFO', 'shutdown selesai');
    process.exit(0);
  }, 2000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

log('INFO', 'bot Antar jalan (polling). Kirim /start di Telegram.');
