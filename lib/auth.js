// Auth via Supabase Auth (email/password). Session dikelola @supabase/ssr
// lewat cookie; proxy.js bertugas menyegarkan + mengarahkan ke /login.
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Nama cookie lama (placeholder) masih dipakai sebagai penanda kode lama.
// Supabase pakai cookie sendiri; konstanta ini sengaja dipertahankan supaya
// call site yang belum dimigrasi tidak rusak.
export const SESSION_COOKIE_NAME = "ct_session";

// User dari cookie sesi TANPA roundtrip ke Supabase Auth. Hanya untuk
// tampilan (nama/email di shell dashboard): proxy.js sudah memverifikasi
// sesi lewat getUser() pada request yang sama, jadi layout tidak perlu
// memanggil server auth lagi di setiap navigasi. Untuk otorisasi (route
// handler yang menulis data) tetap pakai getUser().
export async function getUserDariSesi() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

// Ambil user dari session (diverifikasi ke Supabase Auth), atau null kalau
// belum login. Dipakai dari route handler yang butuh otorisasi.
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
