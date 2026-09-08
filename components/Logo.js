import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/content";

// Satu-satunya tempat logo + wordmark dirender: landing, login, pengaduan,
// dan seluruh dashboard memakai komponen ini.
const SIZES = {
  navbar: { px: 44, box: "h-11 w-11 rounded-xl", text: "text-xl" },
  sidebar: { px: 40, box: "h-10 w-10 rounded-lg", text: "text-xl" },
};

export default function Logo({
  href = "/",
  size = "sidebar",
  tone = "dark",
  priority = false,
  className = "",
}) {
  const s = SIZES[size] ?? SIZES.sidebar;
  return (
    <Link
      href={href}
      className={`flex min-h-11 cursor-pointer items-center gap-2.5 transition-opacity duration-200 hover:opacity-80 ${className}`}
    >
      <span
        className={`flex flex-none items-center justify-center overflow-hidden bg-white shadow-sm ring-1 ring-black/5 ${s.box}`}
      >
        <Image
          src="/logo.png"
          alt={siteConfig.name}
          width={s.px}
          height={s.px}
          className="h-full w-full object-contain"
          priority={priority}
        />
      </span>
      <span
        className={`font-bold tracking-tight transition-colors duration-300 ${s.text} ${
          tone === "light" ? "text-white" : "text-accent"
        }`}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
