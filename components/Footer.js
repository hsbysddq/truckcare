import { footer } from "@/lib/content";
import FadeIn from "@/components/FadeIn";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-slate-950">
      <FadeIn as="div" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo href="/" size="sidebar" tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              {footer.brand.description}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">{footer.bottom.copyright}</p>
          <div className="flex gap-6">
            {footer.bottom.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/40 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
