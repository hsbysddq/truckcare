"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { chatPage } from "@/lib/content";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex-none border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={chatPage.inputPlaceholder}
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
        {chatPage.quickSuggestions.map((suggestion) => (
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
