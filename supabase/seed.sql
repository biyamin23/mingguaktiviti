-- ============================================================
-- PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026
-- Initial Database Seed
-- File: supabase/seed.sql
-- ============================================================

-- 1. Tetapan Merit (Locked Specification)
INSERT INTO public.merit_settings (placement, points) VALUES
    ('Johan', 100),
    ('Naib Johan', 70),
    ('Ketiga', 40),
    ('Keempat', 30),
    ('Kelima', 20),
    ('Penyertaan', 10)
ON CONFLICT (placement) DO UPDATE SET points = EXCLUDED.points;

-- 2. Pertandingan Rasmi Awal (Authoritative Initial Competitions)
-- Tingkatan 1
INSERT INTO public.competitions (name, form) VALUES
    ('Pementasan Cerpen', 1),
    ('Newspaper Scavenger Hunt', 1),
    ('Slot Motivasi', 1),
    ('Misi Menakluk al Gebra', 1),
    ('Slot Malam Citrawarna', 1)
ON CONFLICT (name, form) DO NOTHING;

-- Tingkatan 2
INSERT INTO public.competitions (name, form) VALUES
    ('Slot Motivasi', 2),
    ('Slot Malam Citrawarna', 2)
ON CONFLICT (name, form) DO NOTHING;

-- Tingkatan 3
INSERT INTO public.competitions (name, form) VALUES
    ('Aesira My Challenge (Giant Volleyball Challenge)', 3),
    ('Aesira My Challenge (My Mission Malaysia)', 3),
    ('Slot RBT', 3),
    ('Slot Sejarah', 3),
    ('Slot Malam Citrawarna', 3)
ON CONFLICT (name, form) DO NOTHING;

-- Tingkatan 4: Tiada pertandingan rekaan. Akan ditambah melalui Data Master.
-- Tingkatan 5: Tiada pertandingan sama sekali mengikut spesifikasi.
