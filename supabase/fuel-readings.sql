-- ============================================================
-- Circle T — Telemetri BBM (simulasi deterministik) untuk grafik solar.
-- Skema asli tak punya data BBM; tabel ini diisi angka yang konsisten
-- antar reload supaya Analitik + chat AI punya data sinkron.
-- Kapasitas & pemakaian harian mengikuti lib/truck-types.js
-- (CDD 100/12 L, Fuso 200/25 L, Trailer 400/50 L).
-- Idempotent: hapus lalu isi ulang 90 hari ke belakang.
-- ============================================================

create table if not exists fuel_readings (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid references trucks(id) on delete cascade,
  tanggal date not null,
  liters numeric not null,
  refill boolean not null default false,
  unique (truck_id, tanggal)
);

alter table fuel_readings enable row level security;
drop policy if exists "fuel_readings_baca_publik" on fuel_readings;
create policy "fuel_readings_baca_publik" on fuel_readings for select using (true);
drop policy if exists "fuel_readings_tulis_service" on fuel_readings;
create policy "fuel_readings_tulis_service" on fuel_readings
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

delete from fuel_readings where tanggal >= CURRENT_DATE - 90;

WITH RECURSIVE sim AS (
  SELECT
    t.id AS truck_id,
    t.plat,
    CASE
      WHEN lower(t.tipe) LIKE '%colt%' OR lower(t.tipe) LIKE '%cdd%' THEN 100
      WHEN lower(t.tipe) LIKE '%trailer%' THEN 400
      ELSE 200
    END AS cap,
    CASE
      WHEN lower(t.tipe) LIKE '%colt%' OR lower(t.tipe) LIKE '%cdd%' THEN 12
      WHEN lower(t.tipe) LIKE '%trailer%' THEN 50
      ELSE 25
    END AS use_,
    (CURRENT_DATE - 90) AS tanggal,
    CASE
      WHEN lower(t.tipe) LIKE '%colt%' OR lower(t.tipe) LIKE '%cdd%' THEN 100
      WHEN lower(t.tipe) LIKE '%trailer%' THEN 400
      ELSE 200
    END * 0.92 AS liters,
    false AS refill
  FROM trucks t
  UNION ALL
  SELECT
    truck_id,
    plat,
    cap,
    use_,
    tanggal + 1,
    -- Hari anomali: turun drastis ke 40% level kemarin (selalu melewati
    -- ambang 2x pemakaian harian, aman dari batas bawah tangki).
    -- ((CURRENT_DATE - tanggal) - 1): tanggal di langkah ini adalah hari
    -- kemarin, sedangkan daftar memakai hari anomalinya (hari yang dihitung).
    CASE WHEN ((CURRENT_DATE - tanggal) - 1) IN (
      CASE plat WHEN 'W 1187 EF' THEN 5 WHEN 'W 3324 IJ' THEN 12 WHEN 'AG 4405 QR' THEN 3 ELSE -1 END,
      CASE plat WHEN 'W 3324 IJ' THEN 40 WHEN 'AG 4405 QR' THEN 60 ELSE -1 END
    ) THEN round((liters * 0.4)::numeric, 1)
    WHEN liters < cap * 0.3
    THEN round((cap * (0.95 + 0.05 * (abs(hashtext(plat || tanggal::text || 'r')) % 100) / 100.0))::numeric, 1)
    ELSE round((GREATEST(cap * 0.05,
      liters - use_ * (0.8 + 0.4 * (abs(hashtext(plat || tanggal::text)) % 100) / 100.0)
    ))::numeric, 1)
    END,
    -- Hari anomali tidak dihitung sebagai isi ulang walau tangki rendah.
    (liters < cap * 0.3) AND NOT (((CURRENT_DATE - tanggal) - 1) IN (
      CASE plat WHEN 'W 1187 EF' THEN 5 WHEN 'W 3324 IJ' THEN 12 WHEN 'AG 4405 QR' THEN 3 ELSE -1 END,
      CASE plat WHEN 'W 3324 IJ' THEN 40 WHEN 'AG 4405 QR' THEN 60 ELSE -1 END
    ))
  FROM sim
  WHERE tanggal < CURRENT_DATE - 1
)
INSERT INTO fuel_readings (truck_id, tanggal, liters, refill)
SELECT truck_id, tanggal, liters, refill FROM sim;
