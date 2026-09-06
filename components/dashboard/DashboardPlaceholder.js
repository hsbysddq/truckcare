export default function DashboardPlaceholder({ title, message }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 text-base text-slate-500">{message}</p>
    </div>
  );
}
