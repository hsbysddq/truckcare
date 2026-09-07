"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { pengaturanPage } from "@/lib/content";

const POLA_CHAT_ID = /^-?\d{4,}$/;

export default function AksesBot() {
  const copy = pengaturanPage.telegramCard;
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(null);
  const [chatId, setChatId] = useState("");
  const [nama, setNama] = useState("");
  const [galatForm, setGalatForm] = useState(null);
  const [menambah, setMenambah] = useState(false);
  const [menghapusId, setMenghapusId] = useState(null);

  useEffect(() => {
    let batal = false;
    fetch("/api/pengaturan/telegram", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!batal && Array.isArray(data)) setDaftar(data);
      })
      .catch(() => {
        if (!batal) setGalat(copy.errors.network);
      })
      .finally(() => {
        if (!batal) setMemuat(false);
      });
    return () => {
      batal = true;
    };
  }, [copy.errors.network]);

  async function tambah(event) {
    event.preventDefault();
    if (menambah) return;
    if (!POLA_CHAT_ID.test(chatId.trim())) {
      setGalatForm(copy.errors.chatId);
      return;
    }
    setMenambah(true);
    setGalatForm(null);
    try {
      const res = await fetch("/api/pengaturan/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId.trim(), nama: nama.trim() }),
      });
      if (res.status === 409) {
        setGalatForm(copy.errors.dobel);
        return;
      }
      if (!res.ok) {
        setGalatForm(copy.errors.tambah);
        return;
      }
      const baris = await res.json();
      setDaftar((d) => [baris, ...d]);
      setChatId("");
      setNama("");
    } catch {
      setGalatForm(copy.errors.tambah);
    } finally {
      setMenambah(false);
    }
  }

  async function hapus(id) {
    if (menghapusId) return;
    setMenghapusId(id);
    try {
      const res = await fetch(`/api/pengaturan/telegram/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setGalat(copy.errors.hapus);
        return;
      }
      setDaftar((d) => d.filter((b) => b.id !== id));
    } catch {
      setGalat(copy.errors.hapus);
    } finally {
      setMenghapusId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{copy.description}</p>

      <form onSubmit={tambah} noValidate className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="akses-chat-id"
              className="block text-sm font-medium text-slate-700"
            >
              {copy.chatIdLabel}
            </label>
            <input
              id="akses-chat-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value);
                setGalatForm(null);
              }}
              placeholder={copy.chatIdPlaceholder}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
            />
          </div>
          <div>
            <label
              htmlFor="akses-nama"
              className="block text-sm font-medium text-slate-700"
            >
              {copy.namaLabel}
            </label>
            <input
              id="akses-nama"
              type="text"
              autoComplete="off"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={copy.namaPlaceholder}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
            />
          </div>
        </div>
        {galatForm && (
          <p className="text-xs font-medium text-red-600" role="alert">
            {galatForm}
          </p>
        )}
        <button
          type="submit"
          disabled={menambah}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-70"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {menambah ? copy.menambahLabel : copy.tambahLabel}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4">
        {memuat ? (
          <p className="py-4 text-center text-sm text-slate-400">Memuat...</p>
        ) : galat ? (
          <p className="py-4 text-center text-sm text-red-600" role="alert">
            {galat}
          </p>
        ) : daftar.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            {copy.emptyMessage}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {daftar.map((baris) => (
              <li
                key={baris.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-slate-900">
                    {baris.chatId}
                  </p>
                  {baris.nama && (
                    <p className="truncate text-xs text-slate-500">
                      {baris.nama}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={menghapusId !== null}
                  onClick={() => hapus(baris.id)}
                  aria-label={`${copy.hapusLabel} ${baris.chatId}`}
                  className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}