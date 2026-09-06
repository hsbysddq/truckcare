"use client";

import { useState } from "react";
import { Terminal, ChevronRight } from "lucide-react";

export default function ToolTrace({ trace }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <Terminal className="h-3.5 w-3.5 flex-none" strokeWidth={1.75} />
        <span>{trace.label}</span>
        <ChevronRight
          className={`h-3.5 w-3.5 flex-none transition-transform ${
            open ? "rotate-90" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
          <code>{`> ${trace.command}\n\n${JSON.stringify(trace.result, null, 2)}`}</code>
        </pre>
      )}
    </div>
  );
}
