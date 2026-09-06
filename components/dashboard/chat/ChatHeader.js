import { Bot } from "lucide-react";
import { chatPage } from "@/lib/content";

export default function ChatHeader() {
  return (
    <div className="flex h-16 flex-none items-center gap-3 border-b border-slate-200 px-4 sm:h-20 sm:px-6">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-white">
        <Bot className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {chatPage.agentName}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
          {chatPage.agentStatusLabel}
        </div>
      </div>
    </div>
  );
}
