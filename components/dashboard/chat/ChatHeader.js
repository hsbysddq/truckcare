"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Trash2 } from "lucide-react";
import { chatPage } from "@/lib/content";
import { useChat } from "@/context/ChatContext";

export default function ChatHeader() {
  const { messages, clearHistory } = useChat();
  const [arming, setArming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const timer = useRef(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const kosong = messages.length === 0;

  // Konfirmasi dua ketuk: ketuk pertama mempersenjatai, ketuk kedua
  // menghapus. Bersenjataan kedaluwarsa otomatis setelah 3 detik.
  async function handleHapus() {
    if (kosong || clearing) return;
    if (!arming) {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), 3000);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setArming(false);
    setClearing(true);
    await clearHistory();
    setClearing(false);
  }

  return (
    <div className="flex h-16 flex-none items-center gap-3 border-b border-slate-200 px-4 sm:h-20 sm:px-6">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-white">
        <Bot className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {chatPage.agentName}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
          {chatPage.agentStatusLabel}
        </div>
      </div>
      {!kosong && (
        <button
          type="button"
          onClick={handleHapus}
          disabled={clearing}
          title={arming ? chatPage.clearHistoryConfirm : chatPage.clearHistoryLabel}
          aria-label={arming ? chatPage.clearHistoryConfirm : chatPage.clearHistoryLabel}
          className={`flex h-9 flex-none items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${
            arming
              ? "bg-red-600 text-white hover:bg-red-700"
              : "text-slate-400 hover:bg-slate-100 hover:text-red-600"
          }`}
        >
          {clearing ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          )}
          {arming && !clearing ? chatPage.clearHistoryConfirm : null}
        </button>
      )}
    </div>
  );
}
