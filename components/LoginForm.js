"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginPage } from "@/lib/content";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileContainer = useRef(null);
  const widgetId = useRef(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const envSiap = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  function renderTurnstile() {
    if (!turnstileContainer.current || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(turnstileContainer.current, {
      sitekey: SITE_KEY,
      action: "login",
      callback: setToken,
    });
  }

  function resetTurnstile() {
    if (widgetId.current !== null) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch {}
      setToken("");
    }
  }

  // Gate Turnstile sebelum signInWithPassword. Gagal = blokir login.
  async function cekCaptcha() {
    if (!token) throw new Error(loginPage.captchaError);
    const res = await fetch("/api/auth/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      let msg = "Verifikasi captcha gagal.";
      try {
        const d = await res.json();
        if (d?.error) msg = d.error;
      } catch {}
      throw new Error(msg);
    }
  }

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
      await cekCaptcha();
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
      resetTurnstile();
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

      <div>
        {SITE_KEY ? (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onReady={renderTurnstile}
            />
            <div ref={turnstileContainer} className="cf-turnstile" />
          </>
        ) : (
          <p className="text-xs text-slate-400">{loginPage.captchaIconMissing}</p>
        )}
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
        disabled={submitting || !token}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-70"
      >
        {submitting ? loginPage.submittingLabel : loginPage.submitLabel}
      </button>
    </form>
  );
}
