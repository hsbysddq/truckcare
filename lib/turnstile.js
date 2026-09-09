// Verifikasi server-side Cloudflare Turnstile (canonical siteverify).
// Dipakai route POST /api/pengaduan (action "pengaduan") dan login
// (action "login"). Fail-closed: hostname allowlist kosong atau error
// jaringan = ditolak.
const expectedHostnames = new Set(
  (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
);

export async function verifyTurnstile(token, action, remoteip) {
  if (
    typeof token !== "string" ||
    !token ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return false;
  }
  let result;
  try {
    const r = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET ?? "",
          response: token,
          ...(remoteip ? { remoteip } : {}),
        }),
      }
    );
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    return false;
  }
  return (
    result.success === true &&
    result.action === action &&
    expectedHostnames.has(result.hostname)
  );
}
