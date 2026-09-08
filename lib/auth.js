// Auth via Supabase Auth (email/password). Session dikelola @supabase/ssr
// lewat cookie; proxy.js bertugas menyegarkan + mengarahkan ke /login.
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Nama cookie lama (placeholder) masih dipakai sebagai penanda kode lama.
// Supabase pakai cookie sendiri; konstanta ini sengaja dipertahankan supaya
// call site yang belum dimigrasi tidak rusak.
export const SESSION_COOKIE_NAME = "ct_session";

// Ambil user dari session, atau null kalau belum login.
// Dipakai dari route handler & server component.
export async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
