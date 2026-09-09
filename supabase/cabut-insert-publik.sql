-- Cabut insert publik pada tabel pengaduan.
--
-- Sebelumnya form publik insert langsung via REST (policy
-- pengaduan_insert_publik). Sekarang insert lewat route POST /api/pengaduan
-- yang memverifikasi Cloudflare Turnstile lalu memakai service role,
-- sehingga policy insert publik dicabut (menutup celah spam).
--
-- Jalankan di dashboard Supabase (SQL Editor) setelan route live di Vercel.
drop policy if exists pengaduan_insert_publik on public.pengaduan;

-- Cek: seharusnya tidak ada policy bertipe INSERT lagi di tabel pengaduan.
select policyname, cmd, permissive from pg_policies
where schemaname = 'public' and tablename = 'pengaduan'
  and cmd = 'INSERT';
