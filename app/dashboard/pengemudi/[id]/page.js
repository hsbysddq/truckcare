import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/content";
import { loadDriverDetail } from "@/lib/driver-data";
import DriverDetail from "@/components/dashboard/pengemudi/DriverDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const detail = await loadDriverDetail(id);
  return { title: detail ? detail.driver.name : siteConfig.name };
}

export default async function DriverDetailPage({ params }) {
  const { id } = await params;
  const detail = await loadDriverDetail(id);
  if (!detail) notFound();
  return <DriverDetail detail={detail} />;
}
