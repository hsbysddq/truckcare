"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginPage } from "@/lib/content";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const envSiap = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!envSiap) {
      setGalat(loginPage.envMissingError);
      return;
    }
    setSubmitting(true);
    setGalat(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setGalat(error.message);
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (e) {
      setGalat(e?.message ?? loginPage.envMissingError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={loginPage.passwordPlaceholder}
          className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-tint"
        />
      </div>

      {!envSiap && !galat && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loginPage.envMissingError}
        </p>
      )}

      {galat && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {galat}
        </p>
      )}

      <p className="text-xs text-slate-500">{loginPage.accountHint}</p>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-70"
      >
        {submitting ? loginPage.submittingLabel : loginPage.submitLabel}
      </button>
    </form>
  );
}
