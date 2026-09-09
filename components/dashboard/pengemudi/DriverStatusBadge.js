import { driverStatusMeta } from "@/lib/content";

export default function DriverStatusBadge({ status, className = "" }) {
  const meta = driverStatusMeta[status] ?? driverStatusMeta.tidak_aktif;
  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${meta.dotClass}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
