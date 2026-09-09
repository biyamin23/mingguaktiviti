-- ============================================================
-- PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026
-- Skrip Lengkap Permulaan Pangkalan Data (Full Database Setup)
-- Jalankan skrip ini sekali sahaja di SQL Editor Supabase
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. JADUAL GURU (TEACHERS)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Guru',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teachers_salary_no ON public.teachers(salary_no);

-- 2. JADUAL HOMEROOM (HOMEROOMS) - Tingkatan 1 hingga 5
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_homerooms_unique_advisor 
ON public.homerooms(advisor_teacher_id) 
WHERE advisor_teacher_id IS NOT NULL;

-- 3. JADUAL PERTANDINGAN (COMPETITIONS) - Tingkatan 1 hingga 4 sahaja
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 4),
    pic_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_competitions_name_form UNIQUE (name, form)
);

-- 4. JADUAL TETAPAN MERIT (MERIT SETTINGS)
CREATE TABLE IF NOT EXISTS public.merit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT UNIQUE NOT NULL,
    points INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. JADUAL SLOT AKTIVITI (SCHEDULE SLOTS)
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

-- 6. JADUAL SASARAN TINGKATAN SLOT (SCHEDULE SLOT TARGETS)
CREATE TABLE IF NOT EXISTS public.schedule_slot_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE CASCADE,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 5),
    CONSTRAINT uq_schedule_slot_targets UNIQUE (schedule_slot_id, form)
);
CREATE INDEX IF NOT EXISTS idx_schedule_slot_targets_form ON public.schedule_slot_targets(form);

-- 7. JADUAL KEPUTUSAN PERTANDINGAN (RESULTS)
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE RESTRICT,
    entered_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_results_competition UNIQUE (competition_id)
);

-- 8. JADUAL REKOD PEMENANG & MERIT (RESULT ENTRIES)
CREATE TABLE IF NOT EXISTS public.result_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
    homeroom_id UUID NOT NULL REFERENCES public.homerooms(id) ON DELETE RESTRICT,
    placement INTEGER CHECK (placement BETWEEN 1 AND 5),
    merit INTEGER NOT NULL,
    CONSTRAINT uq_result_entries_result_homeroom UNIQUE (result_id, homeroom_id)
);
CREATE INDEX IF NOT EXISTS idx_result_entries_homeroom_merit ON public.result_entries(homeroom_id, merit);

-- 9. JADUAL LAPORAN BERGAMBAR (REPORTS)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE RESTRICT,
    uploaded_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. JADUAL GAMBAR LAPORAN (REPORT IMAGES)
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

-- 11. JADUAL CONTOH TUTORIAL (TODOS) - Bagi mengesahkan /todos
CREATE TABLE IF NOT EXISTS public.todos (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

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
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Public Read
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
CREATE POLICY "Public read todos" ON public.todos FOR SELECT USING (true);

-- Allow Public Write for Portal Operations
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
CREATE POLICY "Allow write todos" ON public.todos FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET (report-images)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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

-- ============================================================
-- INITIAL DATA SEED (DATA AWAL RASMI)
-- ============================================================

-- 1. Tetapan Merit Terkunci
INSERT INTO public.merit_settings (placement, points) VALUES
    ('Johan', 100),
    ('Naib Johan', 70),
    ('Ketiga', 40),
    ('Keempat', 30),
    ('Kelima', 20),
    ('Penyertaan', 10)
ON CONFLICT (placement) DO UPDATE SET points = EXCLUDED.points;

-- 2. Senarai Guru Awal
INSERT INTO public.teachers (salary_no, name, role) VALUES
    ('G1001', 'Cikgu Ahmad Faris bin Zulkifli', 'Penyelaras Minggu Aktiviti'),
    ('G1002', 'Ustazah Siti Aminah binti Razak', 'Penasihat Homeroom T1'),
    ('G1003', 'Cikgu Mohd Danial bin Hashim', 'Penasihat Homeroom T1'),
    ('G1004', 'Cikgu Nurul Huda binti Othman', 'Penasihat Homeroom T2'),
    ('G1005', 'Cikgu Khairul Anuar bin Salleh', 'Penasihat Homeroom T2'),
    ('G1006', 'Cikgu Wan Noraini binti Wan Ismail', 'Penasihat Homeroom T3'),
    ('G1007', 'Cikgu Muhammad Faiz bin Azman', 'Penasihat Homeroom T3'),
    ('G1008', 'Cikgu Nor Asyikin binti Mat Zin', 'Penasihat Homeroom T4'),
    ('G1009', 'Cikgu Hafiz bin Abdullah', 'Penasihat Homeroom T4'),
    ('G1010', 'Cikgu Rozita binti Ramli', 'Penasihat Homeroom T5'),
    ('G1011', 'Cikgu Azman bin Ibrahim', 'Ketua Bidang Bahasa'),
    ('G1012', 'Cikgu Zulaikha binti Mustafa', 'Ketua Bidang Sains & Matematik'),
    ('G1013', 'Cikgu Syahrul bin Jaafar', 'Ketua Bidang Kemanusiaan')
ON CONFLICT (salary_no) DO NOTHING;

-- 3. Senarai Homeroom MRSM Tumpat
-- Tingkatan 1
INSERT INTO public.homerooms (form, name) VALUES
    (1, '1 Al-Farabi'),
    (1, '1 Ibn Sina'),
    (1, '1 Al-Biruni'),
    (1, '1 Al-Khawarizmi'),
    (1, '1 Al-Razi'),
    (1, '1 Ibn Khaldun'),
-- Tingkatan 2
    (2, '2 Al-Farabi'),
    (2, '2 Ibn Sina'),
    (2, '2 Al-Biruni'),
    (2, '2 Al-Khawarizmi'),
    (2, '2 Al-Razi'),
    (2, '2 Ibn Khaldun'),
-- Tingkatan 3
    (3, '3 Al-Farabi'),
    (3, '3 Ibn Sina'),
    (3, '3 Al-Biruni'),
    (3, '3 Al-Khawarizmi'),
    (3, '3 Al-Razi'),
    (3, '3 Ibn Khaldun'),
-- Tingkatan 4
    (4, '4 Al-Farabi'),
    (4, '4 Ibn Sina'),
    (4, '4 Al-Biruni'),
    (4, '4 Al-Khawarizmi'),
    (4, '4 Al-Razi'),
    (4, '4 Ibn Khaldun'),
-- Tingkatan 5 (Tiada pertandingan, mempunyai homeroom)
    (5, '5 Al-Farabi'),
    (5, '5 Ibn Sina'),
    (5, '5 Al-Biruni')
ON CONFLICT (form, name) DO NOTHING;

-- 4. Pertandingan Rasmi Awal (Tingkatan 1 hingga 3)
INSERT INTO public.competitions (name, form) VALUES
    ('Pementasan Cerpen', 1),
    ('Newspaper Scavenger Hunt', 1),
    ('Slot Motivasi', 1),
    ('Misi Menakluk al Gebra', 1),
    ('Slot Malam Citrawarna', 1),
    ('Slot Motivasi', 2),
    ('Slot Malam Citrawarna', 2),
    ('Aesira My Challenge (Giant Volleyball Challenge)', 3),
    ('Aesira My Challenge (My Mission Malaysia)', 3),
    ('Slot RBT', 3),
    ('Slot Sejarah', 3),
    ('Slot Malam Citrawarna', 3)
ON CONFLICT (name, form) DO NOTHING;

-- 5. Contoh Data Ujian Todos
INSERT INTO public.todos (name) VALUES
    ('Selamat Datang ke Portal Minggu Aktiviti MRSM Tumpat 2026'),
    ('Sambungan Supabase PostgreSQL Berjaya Diaktifkan')
ON CONFLICT DO NOTHING;
