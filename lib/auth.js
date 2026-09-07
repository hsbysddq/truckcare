// Placeholder cookie-based session flag — no real credential check yet.
// Swap this for Supabase Auth (e.g. supabase.auth.getUser()) later without
// touching the call sites, since both middleware.js and the login form only
// depend on this constant.
export const SESSION_COOKIE_NAME = "ct_session";
