-- ============================================================
-- PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026
-- Supabase PostgreSQL Schema Migration
-- File: supabase/migrations/20260909000000_init_schema.sql
-- ============================================================

-- Enable pgcrypto extension for UUID generation if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TEACHERS (GURU)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Guru',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on salary_no for quick login lookup
CREATE INDEX IF NOT EXISTS idx_teachers_salary_no ON public.teachers(salary_no);

-- 2. HOMEROOMS (KELAS HOMEROOM)
CREATE TABLE IF NOT EXISTS public.homerooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 5),
    name TEXT NOT NULL,
    advisor_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    needs_review BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_homerooms_form_name UNIQUE (form, name)
);

-- Ensure 1 teacher advises only 1 homeroom
CREATE UNIQUE INDEX IF NOT EXISTS idx_homerooms_unique_advisor 
ON public.homerooms(advisor_teacher_id) 
WHERE advisor_teacher_id IS NOT NULL;

-- 3. COMPETITIONS (PERTANDINGAN) - Tingkatan 1 hingga 4 sahaja
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 4),
    pic_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_competitions_name_form UNIQUE (name, form)
);

-- 4. MERIT SETTINGS (TETAPAN MERIT)
CREATE TABLE IF NOT EXISTS public.merit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT UNIQUE NOT NULL,
    points INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default merit values locked by specifications
INSERT INTO public.merit_settings (placement, points)
VALUES 
    ('Johan', 100),
    ('Naib Johan', 70),
    ('Ketiga', 40),
    ('Keempat', 30),
    ('Kelima', 20),
    ('Penyertaan', 10)
ON CONFLICT (placement) DO UPDATE SET points = EXCLUDED.points;

-- 5. SCHEDULE SLOTS (JADUAL AKTIVITI)
CREATE TABLE IF NOT EXISTS public.schedule_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    pic_teacher_id UUID REFERENCES public.teachers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_schedule_slots_time CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_slots_date_time ON public.schedule_slots(date, start_time);

-- 6. SCHEDULE SLOT TARGETS (SASARAN TINGKATAN)
CREATE TABLE IF NOT EXISTS public.schedule_slot_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE CASCADE,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 5),
    CONSTRAINT uq_schedule_slot_targets UNIQUE (schedule_slot_id, form)
);

CREATE INDEX IF NOT EXISTS idx_schedule_slot_targets_form ON public.schedule_slot_targets(form);

-- 7. RESULTS (KEPUTUSAN PERTANDINGAN)
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE RESTRICT,
    entered_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_results_competition UNIQUE (competition_id)
);

-- 8. RESULT ENTRIES (KEDUDUKAN & MATA MERIT SETIAP HOMEROOM)
CREATE TABLE IF NOT EXISTS public.result_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
    homeroom_id UUID NOT NULL REFERENCES public.homerooms(id) ON DELETE RESTRICT,
    placement INTEGER CHECK (placement BETWEEN 1 AND 5), -- NULL untuk penerima merit penyertaan
    merit INTEGER NOT NULL, -- Menyimpan mata sejarah tepat pada masa keputusan direkodkan
    CONSTRAINT uq_result_entries_result_homeroom UNIQUE (result_id, homeroom_id)
);

CREATE INDEX IF NOT EXISTS idx_result_entries_homeroom_merit ON public.result_entries(homeroom_id, merit);

-- 9. REPORTS (LAPORAN BERGAMBAR)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE RESTRICT,
    uploaded_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. REPORT IMAGES (GAMBAR LAPORAN BERMAMPAT)
CREATE TABLE IF NOT EXISTS public.report_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    position INTEGER DEFAULT 0,
    file_size BIGINT NOT NULL,
    original_file_size BIGINT,
    width INTEGER,
    height INTEGER,
    mime_type TEXT DEFAULT 'image/webp',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homerooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slot_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all portal data
CREATE POLICY "Public read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public read homerooms" ON public.homerooms FOR SELECT USING (true);
CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Public read merit_settings" ON public.merit_settings FOR SELECT USING (true);
CREATE POLICY "Public read schedule_slots" ON public.schedule_slots FOR SELECT USING (true);
CREATE POLICY "Public read schedule_slot_targets" ON public.schedule_slot_targets FOR SELECT USING (true);
CREATE POLICY "Public read results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public read result_entries" ON public.result_entries FOR SELECT USING (true);
CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public read report_images" ON public.report_images FOR SELECT USING (true);

-- Allow authenticated/anon write access for school operations
-- Note: Current identity model uses verified teacher Nombor Gaji in application layer.
-- This can be restricted to Supabase Auth roles when transitioning to full Supabase Auth.
CREATE POLICY "Allow write teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write homerooms" ON public.homerooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write competitions" ON public.competitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write merit_settings" ON public.merit_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write schedule_slots" ON public.schedule_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write schedule_slot_targets" ON public.schedule_slot_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write results" ON public.results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write result_entries" ON public.result_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write report_images" ON public.report_images FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET CONFIGURATION
-- ============================================================
-- Create 'report-images' bucket in Supabase storage if storage extension is active
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: Public read, Anon/Authenticated upload and delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Report Images' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Public Access Report Images" ON storage.objects FOR SELECT USING (bucket_id = 'report-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow Upload Report Images' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Allow Upload Report Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow Delete Report Images' AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Allow Delete Report Images" ON storage.objects FOR DELETE USING (bucket_id = 'report-images');
    END IF;
END $$;
