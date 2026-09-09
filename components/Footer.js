import { footer } from "@/lib/content";
import FadeIn from "@/components/FadeIn";
import Logo from "@/components/Logo";
import FooterYear from "@/components/FooterYear";
import BackToTop from "@/components/BackToTop";

export default function Footer() {
  return (
    <footer className="bg-slate-950">
      <div
        aria-hidden="true"
        className="h-0.5 bg-gradient-to-r from-accent via-cta to-accent"
      />
      <FadeIn as="div" className="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
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
      </FadeIn>

      <div
        aria-hidden="true"
        className="mt-16 select-none overflow-hidden text-center text-[19vw] font-bold leading-[0.8] tracking-tight text-white/5"
      >
        Circle T
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center lg:px-8">
          <p className="text-center text-sm text-white/40 sm:text-left">
            {footer.bottom.copyrightPrefix}
            <FooterYear />
            {footer.bottom.copyrightSuffix}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:ml-auto">
            {footer.bottom.socials.map((social) => (
              <span key={social.label} className="text-sm text-white/50">
                {social.label}
              </span>
            ))}
          </div>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
