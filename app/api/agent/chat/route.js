import { NextResponse } from "next/server";
import { catatChat, konteksArmada, statistikPengaduan, getComplaintsShape, ambilRiwayatChat, getAnalyticsSourceLive } from "@/lib/supabase";
import { getActiveTrucks } from "@/lib/trucks";
import { getUser } from "@/lib/auth";
import { muatTemuan } from "@/lib/schedule-findings";
import { describeFindings } from "@/lib/schedule-analysis";
import { buildAnalytics } from "@/lib/analytics";
import { getAnalyticsSource } from "@/lib/data";
import { muatPrompt } from "@/lib/agent-config";
import { jadwalPage } from "@/lib/content";

// Riwayat chat dibaca lewat GET /api/chat (app/api/chat/route.js).

// Tool lokal agent: "cek_penyimpangan_jadwal". Pertanyaan soal jadwal/
// penyimpangan dijawab dari lib/schedule-analysis.js (deterministik, tidak
// perlu OpenClaw); temuannya juga disertakan sebagai konteks ke OpenClaw.
const POLA_JADWAL = /\b(jadwal|penyimpangan|deviasi|terlambat|bergerak tanpa)\b/i;

// Tool lokal agent: "statistik_pengaduan". Pertanyaan seputar jumlah/
// statistik pengaduan dijawab deterministik dari tabel pengaduan, apa pun
// kondisi OpenClaw (yang tidak punya konteks pengaduan).
const POLA_PENGADUAN = /pengaduan|keluhan|laporan/i;
const POLA_JUMLAH = /\b(total|jumlah|berapa|diterima|masuk|statistik)\b/i;
const POLA_PENDING = /belum|divalidasi|pending|menunggu/i;

// Tool lokal agent: "status_armada". Ringkasan + daftar per truk dari
// shape yang sama dengan halaman Armada (bebas OpenClaw).
const POLA_ARMADA = /status armada|posisi armada|posisi (semua )?truk/i;

async function jawabanStatusArmada() {
  try {
    const trucks = await getActiveTrucks();
    if (!trucks?.length) return { text: "Belum ada data armada.", total: 0 };
    const jalan = trucks.filter((t) => (t.tripStatus ?? t.status) === "jalan").length;
    const berhenti = trucks.length - jalan;
    const baris = trucks.map((t) => {
      const st = t.tripStatus ?? t.status ?? "-";
      const kec = Math.round(Number(t.speedKph) || 0);
      const tujuan = t.destination ? ` → ${t.destination}` : "";
      return `• ${t.nama} (${t.plateNumber}): ${st}, ${kec} km/jam${tujuan}`;
    });
    // Kartu terstruktur untuk bubble chat (teks lengkap tetap dikirim
    // sebagai fallback riwayat, karena dataCard tak disimpan di chat_logs).
    const kartu = {
      title: `Status armada (${trucks.length}): ${jalan} jalan, ${berhenti} berhenti`,
      rows: trucks.map((t) => {
        const st = t.tripStatus ?? t.status ?? "-";
        const kec = Math.round(Number(t.speedKph) || 0);
        const tujuan = t.destination ? ` → ${t.destination}` : "";
        return {
          label: `${t.nama} (${t.plateNumber})${tujuan}`,
          badge: {
            tone: st === "jalan" ? "success" : "warning",
            label: `${st} · ${kec} km/jam`,
          },
        };
      }),
    };
    return {
      text: `Status armada (${trucks.length}): ${jalan} jalan, ${berhenti} berhenti.\n${baris.join("\n")}`,
      total: trucks.length,
      dataCard: kartu,
    };
  } catch {
    return null;
  }
}

// Tool lokal agent: "driver_truk". Menjawab siapa pengemudi bertugas.
// Plat diambil eksplisit dari pesan, atau dari konteks: pesan-pesan
// terakhir ("truck itu") lalu konteks truk aktif (?truk=PLAT).
const POLA_DRIVER = /driver|sopir|pengemudi|yang (bawa|membawa|mengendarai|mengemudi)/i;
const POLA_PLAT = /\b([A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3})\b/;
const kunciPlatLokal = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

async function jawabanDriver(pesan, userId, trukKonteks) {
  let plat = (pesan.match(POLA_PLAT)?.[1] ?? "").toUpperCase().replace(/\s+/g, " ").trim() || null;
  if (!plat) {
    try {
      const riwayat = await ambilRiwayatChat(userId);
      const terakhir = (riwayat || []).slice(-6).reverse();
      for (const m of terakhir) {
        const cocok = String(m?.text ?? "").match(POLA_PLAT)?.[1];
        if (cocok) {
          plat = cocok.toUpperCase().replace(/\s+/g, " ").trim();
          break;
        }
      }
    } catch {}
  }
  if (!plat) plat = trukKonteks || null;
  if (!plat) return null;
  try {
    const trucks = await getActiveTrucks();
    const t = (trucks || []).find((x) => kunciPlatLokal(x.plateNumber) === kunciPlatLokal(plat));
    if (!t) return { text: `Plat ${plat} tidak terdaftar di armada.`, total: 0 };
    if (t.driverName) {
      const tujuan = t.destination ? ` menuju ${t.destination}` : "";
      return { text: `Pengemudi ${t.nama} (${t.plateNumber}) yang bertugas: ${t.driverName}${tujuan}.`, total: 1 };
    }
    return { text: `${t.nama} (${t.plateNumber}): belum ada driver bertugas tercatat.`, total: 1 };
  } catch {
    return null;
  }
}

// Tool lokal agent: "cek_anomali_solar". Jawaban deterministik dari modul
// analitik yang sama dengan halaman Analitik (insight fuelByTruck).
const POLA_SOLAR = /solar|anomali|bahan bakar|\bbbm\b/i;

function jawabanSolar() {
  return jawabanSolarAsync().catch(() => null);
}

async function jawabanSolarAsync() {
  let source = null;
  try {
    source = await getAnalyticsSourceLive();
  } catch {
    source = getAnalyticsSource(await getActiveTrucks());
  }
  const a = buildAnalytics(source, {});
  // Tanpa telemetri BBM tidak ada anomali yang bisa diperiksa: jawab jujur,
  // bukan angka contoh.
  if (a?.fuelByTruck?.empty) {
    return { text: "Data solar belum tersedia (tidak ada telemetri BBM tersambung), jadi tidak ada anomali yang bisa diperiksa." };
  }
  const insight = a?.fuelByTruck?.insight;
  if (insight) return { text: insight };
  return null;
}

// Tool lokal agent: daftar pengaduan yang menunggu validasi (bukan OpenClaw).
async function jawabanPengaduanMenunggu() {
  try {
    const list = await getComplaintsShape();
    const tunggu = (list || []).filter((c) => c.statusMentah === "menunggu");
    if (!tunggu.length)
      return { text: "Tidak ada pengaduan yang menunggu validasi.", total: 0 };
    const baris = tunggu
      .slice(0, 5)
      .map(
        (c) => `• ${c.plateNumber} (${c.incidentAt}): ${(c.reporterNote ?? "").slice(0, 80)}`
      );
    return { text: `Menunggu validasi (${tunggu.length}):\n${baris.join("\n")}`, total: tunggu.length };
  } catch {
    return null;
  }
}

async function jawabanPengaduan(st) {
  if (!st) return null;
  if (st.total === 0) return { text: "Belum ada pengaduan yang diterima.", total: 0 };
  const baris = [`Total pengaduan diterima: ${st.total}.`];
  for (const s of st.statuses) {
    if (s.jumlah) baris.push(`${s.jumlah} ${s.label}`);
  }
  for (const [k, v] of Object.entries(st.lain)) baris.push(`${v} ${k}`);
  return { text: baris.join("\n"), total: st.total };
}

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
  // System prompt admin (edit dari Pengaturan) ikut dikirim ke agent.
  konteks = konteks ?? { drivers: [], trips: [] };
  konteks.systemPrompt = await muatPrompt();
  // Konteks tambahan untuk agent: statistik pengaduan (best-effort).
  const stPengaduan = await statistikPengaduan().catch(() => null);
  if (stPengaduan) konteks.pengaduan = stPengaduan;

  // Tool status armada deterministik (bebas OpenClaw).
  if (POLA_ARMADA.test(pesan)) {
    const hasil = await jawabanStatusArmada();
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        ...(hasil.dataCard ? { dataCard: hasil.dataCard } : {}),
        toolTrace: {
          label: "Memanggil status_armada",
          command: "status_armada()",
          result: { total: hasil.total },
        },
      });
    }
  }

  // Tool driver truk deterministik (bebas OpenClaw). Menangani juga
  // pertanyaan lanjutan ("truck itu") via riwayat + konteks truk aktif.
  if (POLA_DRIVER.test(pesan)) {
    const hasil = await jawabanDriver(pesan, user.id, truk);
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        toolTrace: {
          label: "Memanggil driver_truk",
          command: "driver_truk()",
          result: { total: hasil.total },
        },
      });
    }
  }

  // Tool anomali solar deterministik (bebas OpenClaw).
  if (POLA_SOLAR.test(pesan)) {
    const hasil = await jawabanSolar();
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        toolTrace: {
          label: "Memanggil cek_anomali_solar",
          command: "cek_anomali_solar()",
          result: {},
        },
      });
    }
  }

  // Tool pengaduan deterministik (bebas OpenClaw). Daftar tunggu bila
  // ditanya soal validasi/pending; statistik bila ditanya jumlah/total.
  if (POLA_PENGADUAN.test(pesan) && POLA_PENDING.test(pesan)) {
    const hasil = await jawabanPengaduanMenunggu();
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        toolTrace: {
          label: "Memanggil daftar_pengaduan_menunggu",
          command: "daftar_pengaduan_menunggu()",
          result: { total: hasil.total },
        },
      });
    }
  }
  if (POLA_PENGADUAN.test(pesan) && POLA_JUMLAH.test(pesan)) {
    const hasil = await jawabanPengaduan(await statistikPengaduan());
    if (hasil) {
      await catatChat(pesan, hasil.text, "tool", user.id);
      return NextResponse.json({
        text: hasil.text,
        mode: "tool",
        toolTrace: {
          label: "Memanggil statistik_pengaduan",
          command: "statistik_pengaduan()",
          result: { total: hasil.total },
        },
      });
    }
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

const OPENCLAW_KEY = process.env.OPENCLAW_API_KEY ?? "";

async function telusurAgent(endpoint, pesan, konteks) {
  if (!endpoint) return null;
  try {
    const headers = { "Content-Type": "application/json" };
    if (OPENCLAW_KEY) headers["X-API-KEY"] = OPENCLAW_KEY;
    const res = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers,
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
