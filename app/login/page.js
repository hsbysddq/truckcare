import { Suspense } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { siteConfig, footer, loginPage } from "@/lib/content";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-2 text-lg font-semibold tracking-tight text-accent transition-opacity duration-200 hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <Truck className="h-5 w-5" strokeWidth={2} />
            </span>
            {siteConfig.name}
          </Link>

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
