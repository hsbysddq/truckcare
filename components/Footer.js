import { footer } from "@/lib/content";
import FadeIn from "@/components/FadeIn";
import Logo from "@/components/Logo";
import FooterYear from "@/components/FooterYear";

export default function Footer() {
  return (
    <footer className="bg-slate-950">
      <FadeIn as="div" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
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
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-sm text-white/50">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/40 sm:text-left">
            {footer.bottom.copyrightPrefix}
            <FooterYear />
            {footer.bottom.copyrightSuffix}
          </p>
        </div>
      </FadeIn>
    </footer>
  );
}
