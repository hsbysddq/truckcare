"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Truck } from "lucide-react";
import { pengaduanPublikPage } from "@/lib/content";
import { isValidPlate, normalizePlate } from "@/lib/format";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAKS_FOTO_BYTES = 2 * 1024 * 1024;
const MIN_DESKRIPSI = 20;
const BUCKET = "foto-pengaduan";

function tanggalHariIni() {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset();
  const lokal = new Date(sekarang.getTime() - offset * 60000);
  return lokal.toISOString().slice(0, 10);
}

export default function PengaduanForm() {
  const copy = pengaduanPublikPage;
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

  function ubah(bidang) {
    return (event) => {
      const nilaiBaru = { ...nilai, [bidang]: event.target.value };
      setNilai(nilaiBaru);
      if (galat[bidang]) setGalat((g) => ({ ...g, [bidang]: null }));
    };
  }

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

  async function simpan(plat, tanggal, jam, deskripsi, fotoUrl) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pengaduan`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plat,
        tanggal,
        jam: jam || null,
        deskripsi: deskripsi.trim(),
        foto_url: fotoUrl || null,
      }),
    });
    if (!res.ok) throw new Error("insert gagal");
    const baris = await res.json();
    return Array.isArray(baris) ? baris[0] : baris;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (memproses) return;
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      setPesanGalat(copy.errors.network);
      return;
    }
    if (!validasi()) return;

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

    try {
      const baris = await simpan(
        normalizePlate(nilai.plat),
        nilai.tanggal,
        nilai.jam,
        nilai.deskripsi,
        fotoUrl
      );
      setTerkirim(baris.id);
    } catch {
      setPesanGalat(copy.errors.network);
    } finally {
      setMemproses(false);
    }
  }

  function ulang() {
    setNilai({ plat: "", tanggal: tanggalHariIni(), jam: "", deskripsi: "" });
    setFoto(null);
    setGalat({});
    setPesanGalat(null);
    setTerkirim(null);
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
            #{terkirim.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <p className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-amber-700">
          {copy.successStatus}
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
              className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-tint ${
                galat.plat
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-accent"
              }`}
              aria-required="true"
            />
            {galat.plat && (
              <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                {galat.plat}
              </p>
            )}
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

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={memproses}
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