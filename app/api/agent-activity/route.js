import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { baca } from "@/lib/supabase";
import { chatPage } from "@/lib/content";

// GET /api/agent-activity — aktivitas agent HARI INI untuk panel kanan Chat AI.
//
// Sumber: tabel agent_runs (lihat supabase/agent-runs.sql) dengan kolom:
//   trigger_type  text      'otomatis' | 'pengguna'
//   complaint_id  uuid null referensi pengaduan yang diproses (bila ada)
//   started_at    timestamptz
//   finished_at   timestamptz null
//   outcome       text      'valid' | 'ditolak' | 'perlu-ditinjau' | 'terkirim'
//                           | 'selesai' | 'gagal' | 'berjalan'
//   notes         text null keterangan singkat untuk ditampilkan
// Tabel diisi oleh agent (OpenClaw/VPS) setiap kali menjalankan tugas.
// Selama tabel belum ada / masih kosong, route ini mengembalikan [] dan UI
// menampilkan keadaan kosong — tidak pernah aktivitas contoh.
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function awalHariIni() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function jam(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function keTampilan(row) {
  const meta = chatPage.activityOutcomeMeta[row.outcome] ?? {
    label: row.outcome ?? "-",
    tone: "info",
  };
  const trigger = row.trigger_type === "pengguna" ? "pengguna" : "otomatis";
  const description =
    row.notes?.trim() ||
    (row.complaint_id
      ? chatPage.activityFallbackDescription.replace("{complaintId}", row.complaint_id)
      : meta.label);
  return {
    id: row.id,
    time: jam(row.finished_at ?? row.started_at),
    trigger,
    description,
    resultLabel: meta.label,
    tone: meta.tone,
  };
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ activities: [] }, { status: 401 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !SERVICE) {
    return NextResponse.json({ activities: [] });
  }
  try {
    const rows = await baca(
      "agent_runs",
      `?select=id,trigger_type,complaint_id,started_at,finished_at,outcome,notes&started_at=gte.${encodeURIComponent(awalHariIni())}&order=started_at.desc&limit=20`,
      SERVICE
    );
    return NextResponse.json({ activities: (rows || []).map(keTampilan) });
  } catch {
    // Tabel belum dibuat atau Supabase tidak bisa dihubungi: tampilkan kosong,
    // jangan gagal keras di panel samping.
    return NextResponse.json({ activities: [] });
  }
}
