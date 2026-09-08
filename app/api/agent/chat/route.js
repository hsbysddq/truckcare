import { NextResponse } from "next/server";
import { catatChat, konteksArmada } from "@/lib/supabase";
import { getUser } from "@/lib/auth";
import { muatTemuan } from "@/lib/schedule-findings";
import { describeFindings } from "@/lib/schedule-analysis";
import { jadwalPage } from "@/lib/content";

// Riwayat chat dibaca lewat GET /api/chat (app/api/chat/route.js).

// Tool lokal agent: "cek_penyimpangan_jadwal". Pertanyaan soal jadwal/
// penyimpangan dijawab dari lib/schedule-analysis.js (deterministik, tidak
// perlu OpenClaw); temuannya juga disertakan sebagai konteks ke OpenClaw.
const POLA_JADWAL = /\b(jadwal|penyimpangan|deviasi|terlambat|bergerak tanpa)\b/i;

async function jalankanToolJadwal() {
  try {
    const { findings, summary } = await muatTemuan();
    const ringkas = `Hari ini ${summary.total} perjalanan: ${summary.onTime} tepat waktu, ${summary.late} terlambat, ${summary.notDeparted} belum berangkat.`;
    return {
      text: `${ringkas}\n\n${jadwalPage.findings.title}:\n${describeFindings(findings)}`,
      findings,
    };
  } catch {
    return null;
  }
}

// POST /api/agent/chat — teruskan pertanyaan ke agent OpenClaw di VPS.
// Konteks armada (driver + trip berjalan) disertakan supaya jawaban
// agent bisa menyebut data aktual. Konsumen: lib/agent.js
// sendMessageToAgent -> return { role: "agent", text }.
export async function POST(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ text: "" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const pesan = body?.message ?? body?.pesan;
  if (!pesan || typeof pesan !== "string") {
    return NextResponse.json({ text: "" }, { status: 400 });
  }
  // Konteks truk aktif dari Chat AI (plat nomor) disisipkan ke pertanyaan
  // yang diteruskan ke agent; teks yang dicatat ke chat_logs tetap asli.
  const truk = typeof body?.truck === "string" ? body.truck.trim().slice(0, 20) : "";
  const pesanAgent = truk ? `[Konteks truk ${truk}] ${pesan}` : pesan;

  // Best-effort: kalau Supabase bermasalah, chat tetap jalan tanpa konteks.
  let konteks = null;
  try {
    konteks = await konteksArmada();
  } catch {
    konteks = null;
  }

  // Pertanyaan soal jadwal dijawab tool lokal supaya hasilnya konsisten
  // dengan halaman Jadwal, apa pun kondisi OpenClaw.
  if (POLA_JADWAL.test(pesan)) {
    const hasil = await jalankanToolJadwal();
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        toolTrace: {
          label: "Memanggil cek_penyimpangan_jadwal",
          command: "cek_penyimpangan_jadwal()",
          result: { total_temuan: hasil.findings.length },
        },
      });
    }
  }

  const endpoint = process.env.OPENCLAW_ENDPOINT;
  const resText = await telusurAgent(endpoint, pesanAgent, konteks);

  if (resText) {
    await catatChat(pesan, resText.jawaban, resText.mode ?? "luring", user.id);
    return NextResponse.json({ text: resText.jawaban, mode: resText.mode ?? "luring" });
  }

  const luring = "Agent AI belum terhubung (OpenClaw belum dikonfigurasi).";
  await catatChat(pesan, luring, "luring", user.id);
  return NextResponse.json({ text: luring, mode: "luring" });
}

async function telusurAgent(endpoint, pesan, konteks) {
  if (!endpoint) return null;
  try {
    const res = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesan, konteks }),
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
