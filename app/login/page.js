import { Suspense } from "react";
import { Truck } from "lucide-react";
import { siteConfig, footer, loginPage } from "@/lib/content";
import LoginForm from "@/components/LoginForm";
import Logo from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo href="/" size="sidebar" priority />

          <h1 className="mt-10 text-2xl font-bold tracking-tight text-slate-900">
            {loginPage.heading}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{loginPage.subheading}</p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-accent px-6 py-16">
        <div className="max-w-sm text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Truck className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            {siteConfig.name}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            {footer.brand.description}
          </p>
        </div>
      </div>
    </div>
  );
}
