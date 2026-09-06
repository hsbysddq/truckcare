import { chatPage } from "@/lib/content";

export default function ChatEmptyState({ onSelectQuestion }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12 text-center">
      <p className="max-w-sm text-base text-slate-600">{chatPage.greeting}</p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {chatPage.exampleQuestionsLabel}
      </p>
      <div className="mt-3 flex w-full max-w-md flex-col gap-2">
        {chatPage.quickSuggestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelectQuestion(question)}
            className="flex min-h-11 items-center rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-700 transition-colors hover:border-accent hover:text-accent"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
