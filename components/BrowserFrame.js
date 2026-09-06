export default function BrowserFrame({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      {children}
    </div>
  );
}
