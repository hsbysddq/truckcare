-- ============================================================
-- Migrasi: plat DK (Bali) -> plat Jawa Timur, sesuai lib/data.js dan
-- simulasi/src/rute.js. Jalankan SEKALI di Supabase SQL Editor pada DB
-- yang sudah terlanjur di-seed dengan plat DK (atau plat L versi lama).
--
-- Update by nama (bukan hapus + insert) supaya id truk tetap sama dan
-- riwayat positions/trips tidak putus. Idempotent: aman di-rerun.
-- ============================================================

update trucks set plat = 'L 8821 AB'  where nama = 'Truk 1'  and plat in ('DK 1234 AB');
update trucks set plat = 'W 9042 CD'  where nama = 'Truk 2'  and plat in ('DK 5678 CD', 'L 9042 CD');
update trucks set plat = 'W 1187 EF'  where nama = 'Truk 3'  and plat in ('DK 9012 EF', 'L 1187 EF');
update trucks set plat = 'L 5560 GH'  where nama = 'Truk 4'  and plat in ('DK 3456 GH');
update trucks set plat = 'W 3324 IJ'  where nama = 'Truk 5'  and plat in ('DK 7890 IJ', 'L 3324 IJ');
update trucks set plat = 'N 7743 KL'  where nama = 'Truk 6'  and plat in ('DK 1122 KL', 'L 7743 KL');
update trucks set plat = 'N 2298 MN'  where nama = 'Truk 7'  and plat in ('DK 3344 MN', 'L 2298 MN');
update trucks set plat = 'W 6612 OP'  where nama = 'Truk 8'  and plat in ('DK 5566 OP', 'L 6612 OP');
update trucks set plat = 'AG 4405 QR' where nama = 'Truk 9'  and plat in ('DK 7788 QR', 'L 4405 QR');
update trucks set plat = 'L 8890 ST'  where nama = 'Truk 10' and plat in ('DK 9900 ST');

-- Pengaduan contoh dari seed.sql lama ikut disesuaikan.
update pengaduan set plat = 'W 9042 CD' where plat in ('DK 5678 CD', 'L 9042 CD');
update pengaduan set plat = 'W 6612 OP' where plat in ('DK 5566 OP', 'L 6612 OP');

-- Posisi lama masih di Bali; simulasi yang di-restart akan mengisi posisi
-- baru di Jawa Timur dan dashboard hanya membaca posisi terbaru per truk.
-- Kalau ingin peta langsung bersih tanpa menunggu, kosongkan posisi lama:
-- delete from positions;
