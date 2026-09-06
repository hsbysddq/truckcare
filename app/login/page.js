"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { siteConfig, footer, loginPage } from "@/lib/content";

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    router.push("/dashboard");
  }

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

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                {loginPage.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={loginPage.emailPlaceholder}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                {loginPage.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={loginPage.passwordPlaceholder}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-70"
            >
              {loginPage.submitLabel}
            </button>
          </form>
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
