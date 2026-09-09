"use client";

import { useState } from "react";
import { ArrowUp, Truck, X } from "lucide-react";
import { chatPage } from "@/lib/content";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export default function ChatInput({ onSend, disabled, truckContext, onClearTruck }) {
  const [value, setValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  const placeholder = truckContext
    ? fill(chatPage.inputPlaceholderWithTruck, { plate: truckContext })
    : chatPage.inputPlaceholder;
  // Saat konteks truk aktif, semua saran menyertakan plat truk itu supaya
  // pertanyaan dikirim spesifik satu truk, bukan rekap seluruh armada.
  const suggestions = truckContext
    ? chatPage.truckQuickSuggestions.map((s) => fill(s, { plate: truckContext }))
    : chatPage.quickSuggestions;

  return (
    <div className="flex-none border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      {truckContext && (
        <div className="mb-3 flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint py-1 pl-3 pr-1 text-xs font-semibold text-accent">
            <Truck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>
              {chatPage.truckContextLabel}: {truckContext}
            </span>
            <button
              type="button"
              onClick={onClearTruck}
              aria-label={chatPage.clearTruckContextLabel}
              className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-11 flex-1 rounded-full border border-slate-200 px-5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Kirim pesan"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSend(suggestion)}
            disabled={disabled}
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 px-4 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
