import { Bot } from "lucide-react";
import { chatPage } from "@/lib/content";

// Tampilan awal saat belum ada percakapan. Pill saran cepat ada di ChatInput,
// jadi di sini hanya ikon, sapaan, dan satu kalimat petunjuk.
export default function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint text-accent">
        <Bot className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <p className="mt-5 text-lg font-semibold text-slate-900">{chatPage.greeting}</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{chatPage.emptyHint}</p>
    </div>
  );
}
