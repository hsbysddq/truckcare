import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseUrl, baca } from "@/lib/supabase";

// API keputusan & catatan pengaduan (digate proxy.js + cek sesi di sini).
//
//   POST   { status: "tervalidasi" | "ditolak", alasan? }
//          Keputusan. "tervalidasi" dikonsultasikan dulu ke agent OpenClaw
//          (fallback diterima otomatis bila agent tak terjangkau).
//   PATCH  { operator_note } | { restore: true }
//          Ubah catatan internal operator, atau pulihkan dari soft delete.
//   DELETE { reason }
//          Soft delete: isi deleted_at + delete_reason. Baris tetap ada.
//   GET    Riwayat perubahan: agent_runs + kolom decided_*/operator_note_at/
//          deleted_at, urut kronologis.
//
// Isi laporan warga (plat, tanggal, jam, deskripsi, foto) TIDAK PERNAH
// diubah lewat route ini. Kolom: lihat supabase/pengaduan-keputusan.sql.

const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const UI_STATUS = { valid: "tervalidasi", ditolak: "ditolak", menunggu: "pending" };

function namaOperator(user) {
  return user?.email ?? user?.id ?? "operator";
}

// 1-3 poin ringkas alasan keputusan: temuan agent bila berbentuk daftar,
// selain itu kalimat pertama-ketiga dari teks alasan.
function poinAlasan(findings, alasan) {
  if (Array.isArray(findings) && findings.length) {
    return findings.map((f) => String(f).trim()).filter(Boolean).slice(0, 3);
  }
  const teks = String(alasan ?? "").trim();
  if (!teks) return [];
  return teks
    .split(/(?<=[.!?])\s+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 3);
}

async function patchPengaduan(id, update) {
  if (!SERVICE) {
    return { error: NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local" }, { status: 500 }) };
  }
  const res = await fetch(`${supabaseUrl()}/rest/v1/pengaduan?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      // Minta representasi supaya bisa bedakan "tidak ada baris cocok" (404)
      // dari update beneran. Tanpa ini PostgREST 204/ok walau 0 baris.
      Prefer: "return=representation",
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    return { error: NextResponse.json({ error: `update pengaduan gagal: ${res.status}` }, { status: 502 }) };
  }
  const baris = await res.json().catch(() => []);
  if (!Array.isArray(baris) || baris.length === 0) {
    return { error: NextResponse.json({ error: "pengaduan tidak ditemukan" }, { status: 404 }) };
  }
  return { row: baris[0] };
}

export async function POST(req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "belum login" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  let status =
    body.status === "tervalidasi" ? "valid" :
    body.status === "ditolak" ? "ditolak" : null;
  if (!status) {
    return NextResponse.json({ error: "status wajib: tervalidasi | ditolak" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const update = { decided_at: now };
  if (status === "valid") {
    const hasil = await validasiAI(id);
    if (hasil) {
      status = hasil.status;
      if (hasil.alasan) update.alasan = hasil.alasan;
      update.diputuskan_oleh = "agent";
      update.decided_by = "agent";
      update.decided_by_name = null;
      update.decision_reason = poinAlasan(hasil.findings, hasil.alasan);
    } else {
      update.alasan = "Validasi AI tidak tersedia, diterima otomatis.";
      update.diputuskan_oleh = "sistem";
      update.decided_by = "sistem";
      update.decided_by_name = null;
      update.decision_reason = [update.alasan];
    }
  } else {
    update.alasan = body.alasan ?? "Ditolak manual oleh operator.";
    update.diputuskan_oleh = "operator";
    update.decided_by = "operator";
    update.decided_by_name = namaOperator(user);
    update.decision_reason = poinAlasan(null, update.alasan);
  }
  update.status = status;

  const { error, row } = await patchPengaduan(id, update);
  if (error) return error;
  return NextResponse.json({
    ok: true,
    status: UI_STATUS[row.status] ?? row.status,
    decisionSource: row.decided_by,
    decidedBy: row.decided_by,
    decidedByName: row.decided_by_name,
    decidedAt: row.decided_at,
    agentReasoning: row.alasan ?? null,
    decisionReasons: Array.isArray(row.decision_reason) ? row.decision_reason : [],
  });
}

export async function PATCH(req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "belum login" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  let update;
  if (body.restore === true) {
    update = { deleted_at: null, delete_reason: null };
  } else if (typeof body.operator_note === "string") {
    const teks = body.operator_note.trim().slice(0, 2000);
    if (!teks) return NextResponse.json({ error: "catatan kosong" }, { status: 400 });
    // Catatan ditambahkan ke daftar (timeline), tidak menimpa yang lama.
    let lama = [];
    try {
      const rows = await baca("pengaduan", `?select=operator_notes&id=eq.${encodeURIComponent(id)}`, SERVICE);
      lama = Array.isArray(rows?.[0]?.operator_notes) ? rows[0].operator_notes : [];
    } catch {
      lama = [];
    }
    const catatan = { by: namaOperator(user), at: new Date().toISOString(), text: teks };
    update = {
      operator_notes: [...lama, catatan],
      operator_note: teks,
      operator_note_at: catatan.at,
    };
  } else {
    return NextResponse.json({ error: "isi operator_note atau restore" }, { status: 400 });
  }

  const { error, row } = await patchPengaduan(id, update);
  if (error) return error;
  return NextResponse.json({
    ok: true,
    operatorNote: row.operator_note ?? null,
    operatorNoteAt: row.operator_note_at ?? null,
    operatorNotes: Array.isArray(row.operator_notes) ? row.operator_notes : [],
    deletedAt: row.deleted_at ?? null,
    deleteReason: row.delete_reason ?? null,
  });
}

export async function DELETE(req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "belum login" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (!reason) return NextResponse.json({ error: "alasan penghapusan wajib diisi" }, { status: 400 });

  const { error, row } = await patchPengaduan(id, {
    deleted_at: new Date().toISOString(),
    delete_reason: `${reason} (${namaOperator(user)})`,
  });
  if (error) return error;
  return NextResponse.json({ ok: true, deletedAt: row.deleted_at, deleteReason: row.delete_reason });
}

// Riwayat perubahan satu laporan, gabungan agent_runs + kolom keputusan.
export async function GET(_req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "belum login" }, { status: 401 });
  const { id } = await params;
  if (!SERVICE) return NextResponse.json({ history: [] });

  try {
    const [rows, runs] = await Promise.all([
      baca(
        "pengaduan",
        `?select=created_at,status,decided_by,decided_by_name,decided_at,operator_note,operator_note_at,operator_notes,deleted_at,delete_reason&id=eq.${encodeURIComponent(id)}`,
        SERVICE
      ),
      baca(
        "agent_runs",
        `?select=id,trigger_type,started_at,finished_at,outcome,notes&complaint_id=eq.${encodeURIComponent(id)}&order=started_at.asc&limit=50`,
        SERVICE
      ).catch(() => []),
    ]);
    const r = rows?.[0];
    if (!r) return NextResponse.json({ error: "pengaduan tidak ditemukan" }, { status: 404 });

    const history = [];
    history.push({ id: "created", at: r.created_at, actor: "pelapor", type: "created" });
    for (const run of runs || []) {
      history.push({
        id: `run-${run.id}`,
        at: run.finished_at ?? run.started_at,
        actor: "agent",
        type: "agent_run",
        outcome: run.outcome,
        note: run.notes ?? null,
      });
    }
    if (r.decided_at) {
      history.push({
        id: "decided",
        at: r.decided_at,
        actor: r.decided_by ?? "operator",
        actorName: r.decided_by_name ?? null,
        type: "decided",
        status: UI_STATUS[r.status] ?? r.status,
      });
    }
    const notes = Array.isArray(r.operator_notes) ? r.operator_notes : [];
    if (notes.length) {
      notes.forEach((n, i) =>
        history.push({ id: `note-${i}`, at: n.at, actor: "operator", actorName: n.by ?? null, type: "note", note: n.text })
      );
    } else if (r.operator_note_at) {
      history.push({ id: "note", at: r.operator_note_at, actor: "operator", type: "note", note: r.operator_note });
    }
    if (r.deleted_at) {
      history.push({ id: "deleted", at: r.deleted_at, actor: "operator", type: "deleted", note: r.delete_reason });
    }
    history.sort((a, b) => new Date(a.at) - new Date(b.at));
    return NextResponse.json({ history });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Tanya agent OpenClaw di VPS. Balik { status: "valid"|"ditolak", alasan? }
// atau null kalau endpoint belum dikonfigurasi / tak terjangkau / gagal.
async function validasiAI(pengaduanId) {
  const endpoint = process.env.OPENCLAW_ENDPOINT;
  if (!endpoint) return null;
  try {
    const res = await fetch(`${endpoint}/api/validasi-pengaduan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengaduan_id: pengaduanId }),
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      status: data?.status === "ditolak" ? "ditolak" : "valid",
      alasan: data?.alasan ?? null,
    };
  } catch {
    return null;
  }
}
