"use client";

import { ArrowUp } from "lucide-react";
import { footer } from "@/lib/content";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={footer.bottom.backToTopLabel}
      title={footer.bottom.backToTopLabel}
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      <ArrowUp className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}
