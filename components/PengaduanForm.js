"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, Truck } from "lucide-react";
import { pengaduanPublikPage } from "@/lib/content";
import { formatPlateInput, isValidPlate, normalizePlate } from "@/lib/format";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAKS_FOTO_BYTES = 2 * 1024 * 1024;
const MIN_DESKRIPSI = 20;
const BUCKET = "foto-pengaduan";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const JEDA_CEK_PLAT_MS = 600;
// Status DB untuk laporan yang platnya tidak terdaftar (lihat
// supabase/pengaduan-luar-armada.sql). Tidak memblokir pengiriman.
const STATUS_LUAR_ARMADA = "luar_armada";

// Tanya server apakah plat terdaftar. Jawaban hanya { found } tanpa detail.
// null = tidak diketahui (jaringan/rate limit), jangan dianggap "tidak ada".
async function cekPlatKeServer(plat, signal) {
  try {
    const res = await fetch("/api/check-plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: plat }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.found === "boolean" ? data.found : null;
  } catch {
    return null;
  }
}

function tanggalHariIni() {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset();
  const lokal = new Date(sekarang.getTime() - offset * 60000);
  return lokal.toISOString().slice(0, 10);
}

export default function PengaduanForm() {
  const copy = pengaduanPublikPage;
  const turnstileContainer = useRef(null);
  const widgetId = useRef(null);
  const [token, setToken] = useState("");
  const [nilai, setNilai] = useState({
    plat: "",
    tanggal: tanggalHariIni(),
    jam: "",
    deskripsi: "",
  });
  const [foto, setFoto] = useState(null);
  const [galat, setGalat] = useState({});
  const [memproses, setMemproses] = useState(false);
  const [pesanGalat, setPesanGalat] = useState(null);
  const [terkirim, setTerkirim] = useState(null);
  // idle | invalid | checking | found | notFound | unknown
  const [cekPlat, setCekPlat] = useState("idle");

  // Token Turnstile single-use: reset widget setiap kali selesai dikirim
  // (berhasil atau gagal) supaya tidak bisa dipakai ulang.
  function renderTurnstile() {
    if (!turnstileContainer.current || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(turnstileContainer.current, {
      sitekey: SITE_KEY,
      action: "pengaduan",
      callback: setToken,
    });
  }

  function resetTurnstile() {
    if (widgetId.current !== null) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch {}
      setToken("");
    }
  }

  function ubah(bidang) {
    return (event) => {
      const mentah = event.target.value;
      const nilaiBaru = {
        ...nilai,
        [bidang]: bidang === "plat" ? formatPlateInput(mentah) : mentah,
      };
      setNilai(nilaiBaru);
      if (galat[bidang]) setGalat((g) => ({ ...g, [bidang]: null }));
    };
  }

  // Cek plat ke server setelah pengguna berhenti mengetik (debounce), bukan
  // tiap ketikan. Format salah ditandai tanpa memanggil server.
  useEffect(() => {
    const plat = nilai.plat;
    if (!plat) {
      setCekPlat("idle");
      return undefined;
    }
    if (!isValidPlate(plat)) {
      setCekPlat("idle");
      const t = setTimeout(() => setCekPlat("invalid"), JEDA_CEK_PLAT_MS);
      return () => clearTimeout(t);
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setCekPlat("checking");
      const found = await cekPlatKeServer(normalizePlate(plat), controller.signal);
      if (controller.signal.aborted) return;
      setCekPlat(found === null ? "unknown" : found ? "found" : "notFound");
    }, JEDA_CEK_PLAT_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [nilai.plat]);

  function validasi() {
    const baru = {};
    if (!isValidPlate(nilai.plat)) baru.plat = copy.errors.plate;
    if (!nilai.tanggal) baru.tanggal = copy.errors.date;
    if (nilai.deskripsi.trim().length < MIN_DESKRIPSI)
      baru.deskripsi = copy.errors.description;
    if (foto && foto.size > MAKS_FOTO_BYTES) baru.foto = copy.errors.photo;
    setGalat(baru);
    return Object.keys(baru).length === 0;
  }

  async function uploadFoto(file) {
    const namaAman = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .slice(-60)
      .toLowerCase();
    const jalur = `${Date.now()}-${namaAman}`;
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${jalur}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      }
    );
    if (!res.ok) throw new Error("upload gagal");
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${jalur}`;
  }

  // Insert lewat /api/pengaduan (verifikasi Turnstile + service role di
  // server). status hanya diisi "luar_armada" bila plat tidak terdaftar.
  async function simpan(plat, tanggal, jam, deskripsi, fotoUrl, status) {
    const res = await fetch("/api/pengaduan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        plat,
        tanggal,
        jam: jam || null,
        deskripsi: deskripsi.trim(),
        foto_url: fotoUrl || null,
        ...(status ? { status } : {}),
      }),
    });
    if (!res.ok) {
      let msg = copy.errors.network;
      try {
        const d = await res.json();
        if (d?.error) msg = d.error;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (memproses) return;
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      setPesanGalat(copy.errors.network);
      return;
    }
    if (!validasi()) return;
    if (!token) {
      setPesanGalat(copy.errors.captcha);
      return;
    }

    setMemproses(true);
    setPesanGalat(null);

    let fotoUrl = null;
    if (foto) {
      try {
        fotoUrl = await uploadFoto(foto);
      } catch {
        setPesanGalat(copy.errors.upload);
      }
    }

    // Hasil cek terakhir dipakai; bila belum ada hasil pasti, cek sekali lagi
    // saat kirim. Tidak diketahui -> status default, biar agent yang memutuskan.
    let terdaftar = cekPlat === "found" ? true : cekPlat === "notFound" ? false : null;
    if (terdaftar === null) {
      terdaftar = await cekPlatKeServer(normalizePlate(nilai.plat));
    }
    const statusAwal = terdaftar === false ? STATUS_LUAR_ARMADA : null;

    try {
      const baris = await simpan(
        normalizePlate(nilai.plat),
        nilai.tanggal,
        nilai.jam,
        nilai.deskripsi,
        fotoUrl,
        statusAwal
      );
      setTerkirim({ id: baris.id, luarArmada: statusAwal === STATUS_LUAR_ARMADA });
    } catch (e) {
      setPesanGalat(e?.message || copy.errors.network);
    } finally {
      resetTurnstile();
      setMemproses(false);
    }
  }

  function ulang() {
    setNilai({ plat: "", tanggal: tanggalHariIni(), jam: "", deskripsi: "" });
    setFoto(null);
    setGalat({});
    setPesanGalat(null);
    setTerkirim(null);
    setCekPlat("idle");
  }

  if (terkirim) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          {copy.successTitle}
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          {copy.successDescription}{" "}
          <span className="font-mono text-base font-bold text-slate-900">
            #{terkirim.id.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <p className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-amber-700">
          {terkirim.luarArmada ? copy.successStatusOutside : copy.successStatus}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
          {copy.successNote}
        </p>
        <button
          type="button"
          onClick={ulang}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          {copy.submitAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {copy.formTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{copy.privacyNote}</p>
        <p className="mt-3 rounded-xl bg-accent-tint px-4 py-3 text-sm leading-relaxed text-accent">
          {copy.introNote}
        </p>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label
              htmlFor="plat"
              className="block text-sm font-medium text-slate-700"
            >
              {copy.plateLabel}
            </label>
            <input
              id="plat"
              type="text"
              autoComplete="off"
              value={nilai.plat}
              onChange={ubah("plat")}
              placeholder={copy.platePlaceholder}
              inputMode="text"
              autoCapitalize="characters"
              maxLength={12}
              aria-describedby="plat-status"
              className={`mt-2 w-full rounded-lg border px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-slate-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-tint ${
                galat.plat || cekPlat === "invalid"
                  ? "border-red-300 focus:border-red-400"
                  : cekPlat === "found"
                    ? "border-emerald-300 focus:border-emerald-400"
                    : "border-slate-200 focus:border-accent"
              }`}
              aria-required="true"
            />
            <div id="plat-status" aria-live="polite">
              {galat.plat || cekPlat === "invalid" ? (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {galat.plat ?? copy.errors.plate}
                </p>
              ) : cekPlat === "checking" ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                  {copy.plateCheck.checking}
                </p>
              ) : cekPlat === "found" ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  {copy.plateCheck.found}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="tanggal"
              className="block text-sm font-medium text-slate-700"
            >
              {copy.dateLabel}
            </label>
            <input
              id="tanggal"
              type="date"
              value={nilai.tanggal}
              onChange={ubah("tanggal")}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
              aria-required="true"
            />
            {galat.tanggal && (
              <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                {galat.tanggal}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="jam"
              className="block text-sm font-medium text-slate-700"
            >
              {copy.timeLabel}
            </label>
            <input
              id="jam"
              type="time"
              value={nilai.jam}
              onChange={ubah("jam")}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
            />
          </div>
        </div>

        {/* Peringatan kuning selebar form: plat tidak terdaftar, tetapi
            laporan tetap boleh dikirim (status luar_armada). */}
        {cekPlat === "notFound" && !galat.plat && (
          <p
            role="status"
            className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2} />
            <span>{copy.plateCheck.notFound}</span>
          </p>
        )}

        <div>
          <label
            htmlFor="deskripsi"
            className="block text-sm font-medium text-slate-700"
          >
            {copy.descriptionLabel}
          </label>
          <textarea
            id="deskripsi"
            rows={5}
            value={nilai.deskripsi}
            onChange={ubah("deskripsi")}
            placeholder={copy.descriptionPlaceholder}
            className={`mt-2 w-full rounded-lg border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-tint ${
              galat.deskripsi
                ? "border-red-300 focus:border-red-400"
                : "border-slate-200 focus:border-accent"
            }`}
            aria-required="true"
          />
          {galat.deskripsi && (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {galat.deskripsi}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="foto"
            className="block text-sm font-medium text-slate-700"
          >
            {copy.photoLabel}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
              {foto ? foto.name : copy.photoHint}
              <input
                id="foto"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setFoto(file);
                  if (galat.foto) setGalat((g) => ({ ...g, foto: null }));
                }}
              />
            </label>
          </div>
          {galat.foto && (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {galat.foto}
            </p>
          )}
        </div>

        {pesanGalat && (
          <p
            className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
            role="alert"
          >
            {pesanGalat}
          </p>
        )}

        <div>
          {SITE_KEY ? (
            <>
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
                onReady={renderTurnstile}
              />
              <div ref={turnstileContainer} className="cf-turnstile" />
            </>
          ) : (
            <p className="text-xs text-slate-400">
              Captcha belum dikonfigurasi. Hubungi tim jika ini berlangsung.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={memproses || !token}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cta-dark disabled:opacity-70 sm:flex-none sm:px-8"
          >
            {memproses ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                {copy.submittingLabel}
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" strokeWidth={1.75} />
                {copy.submitLabel}
              </>
            )}
          </button>
          <p className="text-xs text-slate-400">
            Terkirim langsung ke tim operasional untuk divertifikasi.
          </p>
        </div>
      </div>
    </form>
  );
}