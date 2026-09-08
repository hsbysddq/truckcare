"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { pengaturanPage } from "@/lib/content";

export default function StatusTelegram() {
  const copy = pengaturanPage.telegramStatusCard;
  const [kondisi, setKondisi] = useState("memeriksa");
  const [username, setUsername] = useState(null);
  const [chatId, setChatId] = useState("");
  const [menguji, setMenguji] = useState(false);
  const [hasilUji, setHasilUji] = useState(null);

  useEffect(() => {
    let batal = false;
    fetch("/api/pengaturan/telegram/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (batal) return;
        if (!data?.configured) {
          setKondisi("kosong");
          return;
        }
        setUsername(data.username ?? null);
        setKondisi(data.ok ? "ok" : "gagal");
      })
      .catch(() => {
        if (!batal) setKondisi("gagal");
      });
    return () => {
      batal = true;
    };
  }, []);

  async function uji(event) {
    event.preventDefault();
    if (menguji) return;
    setMenguji(true);
    setHasilUji(null);
    try {
      const res = await fetch("/api/pengaturan/telegram/uji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHasilUji({
          ok: false,
          text: copy.ujiGagal.replace("{reason}", data.error ?? res.status),
        });
        return;
      }
      setHasilUji({
        ok: true,
        text: copy.ujiBerhasil.replace("{chatId}", data.chatId),
      });
    } catch {
      setHasilUji({ ok: false, text: copy.ujiGagal.replace("{reason}", "jaringan") });
    } finally {
      setMenguji(false);
    }
  }

  const badge = {
    memeriksa: { cls: "bg-slate-100 text-slate-500", label: copy.memeriksaLabel },
    ok: { cls: "bg-emerald-50 text-emerald-700", label: copy.terhubungLabel },
    gagal: { cls: "bg-red-50 text-red-700", label: copy.belumTerhubungLabel },
    kosong: { cls: "bg-amber-50 text-amber-700", label: copy.belumDikonfigurasiLabel },
  }[kondisi];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{copy.description}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">{copy.statusLabel}</dt>
          <dd>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
              <span
                className={`h-1.5 w-1.5 flex-none rounded-full ${
                  kondisi === "ok" ? "bg-emerald-500" : kondisi === "memeriksa" ? "bg-slate-400" : "bg-red-500"
                }`}
              />
              {badge.label}
            </span>
          </dd>
        </div>
        {username && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">{copy.botLabel}</dt>
            <dd className="font-mono font-medium text-slate-900">@{username}</dd>
          </div>
        )}
      </dl>

      {kondisi === "kosong" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {copy.belumDikonfigurasiHelp}
        </p>
      )}

      <form onSubmit={uji} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
          <label htmlFor="uji-chat-id" className="block text-sm font-medium text-slate-700">
            {copy.chatIdLabel}
          </label>
          <input
            id="uji-chat-id"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder={copy.chatIdPlaceholder}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
          />
          <button
            type="submit"
            disabled={menguji || kondisi === "memeriksa" || kondisi === "kosong"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/30 px-5 text-sm font-semibold text-accent transition-colors hover:bg-accent-tint disabled:opacity-60"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
            {menguji ? copy.mengujiLabel : copy.ujiLabel}
          </button>
          {hasilUji && (
            <p
              role="status"
              className={`text-sm ${hasilUji.ok ? "text-emerald-700" : "text-red-600"}`}
            >
              {hasilUji.text}
            </p>
          )}
        </form>
    </div>
  );
}
