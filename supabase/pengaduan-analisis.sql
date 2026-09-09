-- ============================================================
-- Circle T — Migration: hasil analisis otomatis pada tabel pengaduan.
-- Diisi lib/complaint-analysis.js (analyzeComplaint) segera setelah laporan
-- masuk, atau lewat tombol "Analisis ulang" di dashboard.
-- Jalankan di Supabase SQL Editor SETELAH pengaduan-alasan-catatan.sql.
--
--   analysis_status  menunggu | berjalan | selesai | gagal | luar_armada
--   analyzed_at      waktu analisis terakhir selesai/gagal
--   verdict          terbukti | tidak_terbukti | sedang_diperiksa | luar_armada
--   reasoning        kalimat penjelasan (disusun dari angka yang dihitung kode)
--   evidence         jsonb: plat, jenis truk, kecepatan maks/rata-rata, koordinat
--                    titik tercepat, rentang waktu, pengemudi bertugas (atau
--                    driverUncertain), deret kecepatan untuk grafik
--   truck_id         truk yang cocok dengan plat laporan (null bila luar armada)
--   driver_id        pengemudi bertugas menurut jadwal (null bila tidak pasti)
--   analysis_error   pesan kegagalan terakhir
-- ============================================================

alter table pengaduan
  add column if not exists analysis_status text not null default 'menunggu'
    check (analysis_status in ('menunggu', 'berjalan', 'selesai', 'gagal', 'luar_armada')),
  add column if not exists analyzed_at timestamptz,
  add column if not exists verdict text
    check (verdict in ('terbukti', 'tidak_terbukti', 'sedang_diperiksa', 'luar_armada')),
  add column if not exists reasoning text,
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists truck_id uuid references trucks(id) on delete set null,
  add column if not exists driver_id uuid references drivers(id) on delete set null,
  add column if not exists analysis_error text;

create index if not exists idx_pengaduan_analysis_status on pengaduan (analysis_status);

-- Laporan lama yang sudah diputuskan dianggap selesai dianalisis supaya tidak
-- ikut antre; yang masih menunggu akan diproses saat tombol Analisis ulang
-- ditekan atau laporan baru masuk.
update pengaduan set analysis_status = 'selesai'
 where analysis_status = 'menunggu' and status in ('valid', 'ditolak');
update pengaduan set analysis_status = 'luar_armada', verdict = 'luar_armada'
 where status = 'luar_armada' and analysis_status = 'menunggu';
