// Notifikasi harian jam 9 malam — rangkum pengaduan hari ini ke owner via Telegram.
// Dipanggil cron/Vercel Cron: `npm run notif` (atau node src/notif-harian.js)
import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
  console.error('Isi TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID di telegram/.env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bot = new TelegramBot(token, { polling: false });

async function main() {
  const hariIni = new Date().toISOString().slice(0, 10);

  const { data: pengaduan } = await supabase
    .from('pengaduan')
    .select('*')
    .eq('tanggal', hariIni);

  const total = pengaduan?.length ?? 0;
  const valid = pengaduan?.filter((p) => p.status === 'valid').length ?? 0;
  const ditolak = pengaduan?.filter((p) => p.status === 'ditolak').length ?? 0;
  const menunggu = pengaduan?.filter((p) => p.status === 'menunggu').length ?? 0;

  let pesan = `Ringkasan pengaduan hari ini (${hariIni}):\n`;
  pesan += `• Total: ${total}\n`;
  pesan += `• Valid: ${valid}\n`;
  pesan += `• Ditolak AI: ${ditolak}\n`;
  pesan += `• Menunggu: ${menunggu}\n`;
  if (total === 0) pesan += '\nTidak ada laporan masuk.';

  await bot.sendMessage(chatId, pesan);
  console.log('Notifikasi harian terkirim:', pesan);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
