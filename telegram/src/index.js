// Telegram bot Antar — owner bisa tanya status armada langsung dari HP.
// Polling mode (tanpa webhook) supaya gampang jalan di VPS.
import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChat = process.env.TELEGRAM_CHAT_ID;

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

async function statusArmada() {
  const { data: posisi } = await supabase
    .from('positions')
    .select('*')
    .order('ts', { ascending: false })
    .limit(100);
  const { data: trips } = await supabase.from('trips').select('*').eq('status', 'berjalan');
  const { data: trucks } = await supabase.from('trucks').select('*');

  const byTruk = new Map((trucks ?? []).map((t) => [t.id, t]));
  const byTrip = new Map((trips ?? []).map((t) => [t.truk_id, t]));
  const seen = new Set();
  const baris = [];
  for (const p of posisi ?? []) {
    if (seen.has(p.truk_id)) continue;
    seen.add(p.truk_id);
    const truk = byTruk.get(p.truk_id);
    const trip = byTrip.get(p.truk_id);
    if (!truk) continue;
    const status = p.status === 'jalan' ? 'jalan' : 'berhenti';
    const tujuan = trip?.tujuan ?? '?';
    baris.push(`• ${truk.nama} (${truk.plat}): ${status}, menuju ${tujuan}, ${Number(p.kecepatan ?? 0).toFixed(0)} km/jam`);
  }
  return baris.length ? `Status armada:\n${baris.join('\n')}` : 'Belum ada data posisi.';
}

bot.onText(/\/status/, async (msg) => {
  if (allowedChat && String(msg.chat.id) !== String(allowedChat)) return;
  try {
    await bot.sendMessage(msg.chat.id, await statusArmada());
  } catch (e) {
    console.error(e);
    await bot.sendMessage(msg.chat.id, 'Gagal mengambil status.');
  }
});

bot.on('message', async (msg) => {
  if (allowedChat && String(msg.chat.id) !== String(allowedChat)) return;
  const teks = (msg.text || '').trim();
  if (!teks || teks.startsWith('/')) return;
  // Pertanyaan bebas: arahkan ke /status atau balas ringkas
  try {
    await bot.sendMessage(
      msg.chat.id,
      'Gunakan /status untuk lihat posisi armada. Untuk tanya AI lebih dalam, buka aplikasi Antar.'
    );
  } catch (e) {
    console.error(e);
  }
});

console.log('Bot Antar jalan (polling). Kirim /status di Telegram.');
