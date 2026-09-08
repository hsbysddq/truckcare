// Klien Supabase Auth untuk sisi server (Next.js). Dipakai di proxy,
// route handler, dan server component untuk membaca/menyegarkan session.
// pakai anon key (bukan service role) karena hanya butuh baca session user.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component bisa lempar. Abaikan, biar
            // middleware yang refresh session.
          }
        },
      },
    }
  );
}
