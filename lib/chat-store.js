// Lapisan penyimpanan percakapan Chat AI. Hanya dipanggil dari route
// handler app/api/chat — komponen tidak pernah menyentuh modul ini.
//
// IMPLEMENTASI SEKARANG: memori server. Hilang saat proses restart, dan di
// hosting serverless tiap instance punya memorinya sendiri. Cukup untuk
// demo; untuk produksi ganti isi getMessages/saveMessage dengan query
// Supabase — antarmuka fungsinya sudah async dan bentuk record-nya sudah
// mengikuti skema tabel di bawah, jadi API route dan komponen tidak berubah.
//
// SKEMA TABEL YANG DIBUTUHKAN (mis. public.chat_messages):
//   id            uuid primary key default gen_random_uuid()
//   role          text not null check (role in ('user', 'agent'))
//   content       text not null
//   tool_trace    jsonb null      -- { label, command, result } dari agent
//   data_card     jsonb null      -- opsional: kartu ringkasan { title, rows }
//   truck_context text null       -- plat truk bila chat dibuka dari detail truk
//   created_at    timestamptz not null default now()
// Urutkan pembacaan by created_at asc.

import { randomUUID } from "node:crypto";
import { getChatHistory } from "./data.js";

// Simpan di globalThis supaya bertahan saat modul di-reload oleh HMR dev.
const store = (globalThis.__circleTChatStore ??= {
  seeded: false,
  messages: [],
});

// Percakapan contoh dari lib/data.js sebagai isi awal. Saat pindah ke
// Supabase, hapus seeding ini — riwayat asli datang dari tabel.
function seedIfEmpty() {
  if (store.seeded) return;
  store.seeded = true;
  const base = Date.now() - 60 * 60 * 1000;
  store.messages = getChatHistory().map((message, index) => ({
    id: randomUUID(),
    role: message.role,
    content: message.text,
    tool_trace: message.toolTrace ?? null,
    data_card: message.dataCard ?? null,
    truck_context: null,
    created_at: new Date(base + index * 60 * 1000).toISOString(),
  }));
}

export async function getMessages() {
  seedIfEmpty();
  return [...store.messages].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
}

export async function saveMessage({
  role,
  content,
  toolTrace = null,
  dataCard = null,
  truckContext = null,
}) {
  seedIfEmpty();
  const record = {
    id: randomUUID(),
    role,
    content,
    tool_trace: toolTrace,
    data_card: dataCard,
    truck_context: truckContext,
    created_at: new Date().toISOString(),
  };
  store.messages.push(record);
  return record;
}
