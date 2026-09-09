"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { pengaturanPage } from "@/lib/content";

export default function AgentPromptPanel() {
  const copy = pengaturanPage.agentPromptCard;
  const [memuat, setMemuat] = useState(true);
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState(null);
  const [pesan, setPesan] = useState(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const res = await fetch("/api/pengaturan/agent", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (batal) return;
        if (res.ok && typeof data?.prompt === "string") setPrompt(data.prompt);
        else setGalat(data?.error ?? copy.loadError);
      } catch {
        if (!batal) setGalat(copy.loadError);
      } finally {
        if (!batal) setMemuat(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, [copy.loadError]);

  async function simpan(event) {
    event.preventDefault();
    if (memproses) return;
    if (!prompt.trim()) {
      setGalat(copy.emptyError);
      return;
    }
    setMemproses(true);
    setGalat(null);
    setPesan(null);
    try {
      const res = await fetch("/api/pengaturan/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? copy.saveError);
      setPesan(copy.savedMessage);
    } catch (e) {
      setGalat(e?.message ?? copy.saveError);
    } finally {
      setMemproses(false);
    }
  }

  const textareaRef = useRef(null);

  return (
    <form onSubmit={simpan} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{copy.description}</p>

      <label htmlFor="agent-prompt" className="mt-5 block text-sm font-medium text-slate-700">
        {copy.fieldLabel}
      </label>
      <textarea
        ref={textareaRef}
        id="agent-prompt"
        rows={12}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        spellCheck={false}
        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm leading-relaxed text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint disabled:opacity-60"
        disabled={memuat}
      />

      {galat && (
        <p
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {galat}
        </p>
      )}
      {pesan && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          {pesan}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={memproses || memuat}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {memproses ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.75} />
          )}
          {memproses ? copy.savingLabel : copy.saveLabel}
        </button>
        <p className="text-xs text-slate-400">{copy.hint}</p>
      </div>
    </form>
  );
}
