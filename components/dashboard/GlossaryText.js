"use client";

import { useId, useState } from "react";
import { CircleHelp } from "lucide-react";
import { glossary } from "@/lib/content";

// Merender teks apa adanya, lalu menyisipkan ikon tanda tanya kecil setelah
// kemunculan pertama tiap istilah di lib/content.js `glossary`. Tooltip
// muncul saat hover, fokus keyboard, atau disentuh (toggle) di layar sentuh.
const TERMS = Object.keys(glossary).sort((a, b) => b.length - a.length);
const PATTERN = new RegExp(`(${TERMS.map((t) => t.replace(/\s+/g, "\s+")).join("|")})`, "i");

function TermTooltip({ term }) {
  const id = useId();
  // hover/fokus membuka sementara; klik/sentuh mengunci sampai diklik lagi.
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;
  const definition = glossary[term];
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Penjelasan ${term}`}
        aria-describedby={id}
        aria-expanded={open}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => {
          setHover(false);
          setPinned(false);
        }}
        onKeyDown={(e) => e.key === "Escape" && setPinned(false)}
        onClick={() => setPinned((v) => !v)}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <CircleHelp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="absolute left-1/2 top-full z-popover mt-1 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 whitespace-normal text-left text-xs font-normal normal-case leading-snug tracking-normal text-white shadow-lg"
      >
        {definition}
      </span>
    </span>
  );
}

export default function GlossaryText({ text }) {
  if (typeof text !== "string") return text ?? null;
  const parts = text.split(PATTERN);
  const seen = new Set();
  return parts.map((part, i) => {
    const key = part.toLowerCase().replace(/\s+/g, " ");
    if (glossary[key] && !seen.has(key)) {
      seen.add(key);
      return (
        <span key={i} className="whitespace-nowrap">
          {part}
          <TermTooltip term={key} />
        </span>
      );
    }
    return part;
  });
}
