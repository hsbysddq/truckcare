-- Status baru "luar_armada" pada tabel pengaduan (complaints publik):
-- laporan yang plat nomornya tidak terdaftar di armada saat dikirim.
-- Diisi form pengaduan publik berdasarkan jawaban /api/check-plate;
-- agent tetap mencocokkan plat dan waktu sendiri saat memproses laporan.
--
-- Nilai status yang dikenal:
--   menunggu | valid | ditolak | perlu-ditinjau | luar_armada
--
-- Jalankan di SQL Editor Supabase setelah schema.sql.

comment on column pengaduan.status is
  'menunggu | valid | ditolak | perlu-ditinjau | luar_armada (plat tidak terdaftar di armada saat laporan dikirim)';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pengaduan_status_check'
  ) then
    alter table pengaduan
      add constraint pengaduan_status_check
      check (status in ('menunggu', 'valid', 'ditolak', 'perlu-ditinjau', 'luar_armada'))
      not valid;
  end if;
end $$;
