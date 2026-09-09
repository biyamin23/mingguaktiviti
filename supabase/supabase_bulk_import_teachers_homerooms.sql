-- ============================================================
-- PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026
-- BULK IMPORT MASTER DATA: 147 GURU & 52 HOMEROOM
-- File: supabase/supabase_bulk_import_teachers_homerooms.sql
-- ============================================================

-- Pastikan Extension pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- BAHAGIAN 1: STRUKTUR SKEMA (SCHEMA SETUP)
-- ============================================================

-- 1. TEACHERS
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Guru',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teachers_salary_no ON public.teachers(salary_no);

-- 2. HOMEROOMS
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

-- 3. COMPETITIONS (T1-T4 Sahaja)
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 4),
    pic_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_competitions_name_form UNIQUE (name, form)
);

-- 4. MERIT SETTINGS
CREATE TABLE IF NOT EXISTS public.merit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT UNIQUE NOT NULL,
    points INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SCHEDULE SLOTS
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

-- 6. SCHEDULE SLOT TARGETS
CREATE TABLE IF NOT EXISTS public.schedule_slot_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE CASCADE,
    form INTEGER NOT NULL CHECK (form BETWEEN 1 AND 5),
    CONSTRAINT uq_schedule_slot_targets UNIQUE (schedule_slot_id, form)
);
CREATE INDEX IF NOT EXISTS idx_schedule_slot_targets_form ON public.schedule_slot_targets(form);

-- 7. RESULTS
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE RESTRICT,
    entered_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_results_competition UNIQUE (competition_id)
);

-- 8. RESULT ENTRIES
CREATE TABLE IF NOT EXISTS public.result_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
    homeroom_id UUID NOT NULL REFERENCES public.homerooms(id) ON DELETE RESTRICT,
    placement INTEGER CHECK (placement BETWEEN 1 AND 5),
    merit INTEGER NOT NULL,
    CONSTRAINT uq_result_entries_result_homeroom UNIQUE (result_id, homeroom_id)
);
CREATE INDEX IF NOT EXISTS idx_result_entries_homeroom_merit ON public.result_entries(homeroom_id, merit);

-- 9. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_slot_id UUID NOT NULL REFERENCES public.schedule_slots(id) ON DELETE RESTRICT,
    uploaded_by_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. REPORT IMAGES
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

-- 11. TODOS (Tutorial Verification)
CREATE TABLE IF NOT EXISTS public.todos (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
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

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read teachers" ON public.teachers;
    CREATE POLICY "Public read teachers" ON public.teachers FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write teachers" ON public.teachers;
    CREATE POLICY "Allow write teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read homerooms" ON public.homerooms;
    CREATE POLICY "Public read homerooms" ON public.homerooms FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write homerooms" ON public.homerooms;
    CREATE POLICY "Allow write homerooms" ON public.homerooms FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read competitions" ON public.competitions;
    CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write competitions" ON public.competitions;
    CREATE POLICY "Allow write competitions" ON public.competitions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read merit_settings" ON public.merit_settings;
    CREATE POLICY "Public read merit_settings" ON public.merit_settings FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write merit_settings" ON public.merit_settings;
    CREATE POLICY "Allow write merit_settings" ON public.merit_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read schedule_slots" ON public.schedule_slots;
    CREATE POLICY "Public read schedule_slots" ON public.schedule_slots FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write schedule_slots" ON public.schedule_slots;
    CREATE POLICY "Allow write schedule_slots" ON public.schedule_slots FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read schedule_slot_targets" ON public.schedule_slot_targets;
    CREATE POLICY "Public read schedule_slot_targets" ON public.schedule_slot_targets FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write schedule_slot_targets" ON public.schedule_slot_targets;
    CREATE POLICY "Allow write schedule_slot_targets" ON public.schedule_slot_targets FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read results" ON public.results;
    CREATE POLICY "Public read results" ON public.results FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write results" ON public.results;
    CREATE POLICY "Allow write results" ON public.results FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read result_entries" ON public.result_entries;
    CREATE POLICY "Public read result_entries" ON public.result_entries FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write result_entries" ON public.result_entries;
    CREATE POLICY "Allow write result_entries" ON public.result_entries FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read reports" ON public.reports;
    CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write reports" ON public.reports;
    CREATE POLICY "Allow write reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read report_images" ON public.report_images;
    CREATE POLICY "Public read report_images" ON public.report_images FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write report_images" ON public.report_images;
    CREATE POLICY "Allow write report_images" ON public.report_images FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read todos" ON public.todos;
    CREATE POLICY "Public read todos" ON public.todos FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow write todos" ON public.todos;
    CREATE POLICY "Allow write todos" ON public.todos FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Storage Bucket report-images
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
-- BAHAGIAN 2: TETAPAN MERIT & PERTANDINGAN RASMI
-- ============================================================
INSERT INTO public.merit_settings (placement, points) VALUES
    ('Johan', 100),
    ('Naib Johan', 70),
    ('Ketiga', 40),
    ('Keempat', 30),
    ('Kelima', 20),
    ('Penyertaan', 10)
ON CONFLICT (placement) DO UPDATE SET points = EXCLUDED.points;

-- Pertandingan Rasmi T1-T3
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

-- Todos
INSERT INTO public.todos (name) VALUES
    ('Selamat Datang ke Portal Minggu Aktiviti MRSM Tumpat 2026'),
    ('Pangkalan Data Supabase Rasmi Berjaya Dikonfigurasi')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BAHAGIAN 3: IMPORT MASTER GURU (147 REKOD)
-- ============================================================
INSERT INTO public.teachers (salary_no, name, role) VALUES
    ('201801', 'HOMEROOM TG 1', 'Guru'),
    ('201802', 'HOMEROOM TG 2', 'Guru'),
    ('201803', 'HOMEROOM TG 3', 'Guru'),
    ('201804', 'HOMEROOM TG 4', 'Guru'),
    ('201805', 'HOMEROOM TG 5', 'Guru'),
    ('322102', 'MUHAMMAD HARITH AIMAN BIN SHUHAIMI', 'Guru'),
    ('332176', 'NURUL ASYIQIN AMMALEEYNA BINTI SAMSURI', 'Guru'),
    ('209539', 'SAIFUL BAHRI B. HASAM', 'Guru'),
    ('331290', 'AISAR IZZUDDIN BIN ROSLAN', 'Guru'),
    ('286219', 'HAJAR NADIA BINTI ABDUL ZUBIR', 'Guru'),
    ('92652', 'HASLINA BINTI ABDUL RAHMAN', 'Guru'),
    ('265269', 'HASYIMAH BINTI HASHIM', 'Guru'),
    ('215837', 'MOHD NASRUN BIN ABDULLAH', 'Guru'),
    ('208996', 'NOOR HAZREEN BINTI MOHD AYOP', 'Guru'),
    ('252557', 'NURUL AZRA BT HAZAN', 'Guru'),
    ('237378', 'ROHANI BINTI MUKHTAR', 'Guru'),
    ('213606', 'SALWANA BINTI ABDUL SALAM', 'Guru'),
    ('287373', 'ZATIL AQMAR BT MOHD BASARI', 'Guru'),
    ('316309', 'AHMED HAFIZAINOL BIN AHMED IDRIS', 'Guru'),
    ('276083', 'MAIMUN BINTI SAIDIN', 'Guru'),
    ('316969', 'MOHD FAIZ BIN JUMARI', 'Guru'),
    ('257772', 'MOHD SHAH RIDZUAN BIN ISMAIL', 'Guru'),
    ('320997', 'MUHAMMAD ASHRAF ADZHA BIN ISMAIL', 'Guru'),
    ('283597', 'NURNAZIFAH BINTI MAT AKHIR', 'Guru'),
    ('212393', 'NUZULA BINTI OTHMAN', 'Guru'),
    ('201100', 'SALMIAH BT HAMAT', 'Guru'),
    ('268680', 'SITI RUHAIDA BINTI DIN', 'Guru'),
    ('210971', 'FARIDAH BT CHE HARUN', 'Guru'),
    ('247630', 'FATMAWATI BT HAMAD @ AHMAD LUTFI', 'Guru'),
    ('201414', 'NORMA BINTI PAUZI', 'Guru'),
    ('256333', 'NUR FARIZAN BINTI MOHAMAD', 'Guru'),
    ('242017', 'SURIANA BINTI CHE HARUN', 'Guru'),
    ('281353', 'WARHASNARZIRAH BT AHMAD', 'Guru'),
    ('71961', 'MOHD NOR APANDI BIN CHE WAN', 'Guru'),
    ('279404', 'MUHAMMAD HAFIZ BIN AB HAMID', 'Guru'),
    ('301741', 'AIMIE SHAZLIZA BINTI ISHAK', 'Guru'),
    ('291327', 'ARIFAH BINTI HUSSAIN', 'Guru'),
    ('300234', 'FATIN NADIAH BINTI ABD AZIZ', 'Guru'),
    ('286206', 'HAMIZA BINTI AZIMI', 'Guru'),
    ('205708', 'MOHAMMAD RAHIMY FITRY BIN ISMAIL', 'Guru'),
    ('200677', 'MOHD NOORZI BIN MOHD NOOR', 'Guru'),
    ('324553', 'NUR FARHANA BINTI SAMSULSAHRI', 'Guru'),
    ('282718', 'MUHAMMAD BIN YUSUF', 'Guru'),
    ('269016', 'NIK MOHAMED AZLI BIN NIK YAACOB', 'Guru'),
    ('209953', 'WAN RHYNA BT WAN HUSSIN', 'Guru'),
    ('279747', 'MOHD ZULFAZLI BIN MOHD RAMLI', 'Guru'),
    ('273905', 'MUHAMMAD GHAZALI BIN YAHYA', 'Guru'),
    ('248273', 'NIK SITI HAJJAR BINTI MAT TAIB', 'Guru'),
    ('282187', 'ANUAR SYAHRIN BIN WAHID', 'Guru'),
    ('271253', 'MOHD AZAM BIN MANAF', 'Guru'),
    ('84877', 'SHUKRI BIN MUHAMMAD', 'Guru'),
    ('308650', 'AINA FARAHANA BT MOHD ZAID', 'Guru'),
    ('319898', 'DANIAL FIKRI BIN SAMSUDIN', 'Guru'),
    ('301699', 'MOHD FAHIM BIN JAAFAR', 'Guru'),
    ('291071', 'MOHD SYARIFUAD BIN ABDULLAH', 'Guru'),
    ('333333', 'MUHAMAD SOLEH HUDIN BIN SHAMSUDDIN', 'Guru'),
    ('301806', 'NORFAZILAH BT MOHAMAD ZULDIN', 'Guru'),
    ('247627', 'NUR ADILA BT MOHAMAD NADZIR', 'Guru'),
    ('960323', 'NUR ANIS BINTI RAJAB', 'Guru'),
    ('306209', 'NURUL SYAZWANIE BT ABDUL GHANI', 'Guru'),
    ('308676', 'SAIDAH NAFISAH BT ZULKUPLI', 'Guru'),
    ('280668', 'SITI ROHANI BT JAAFAR', 'Guru'),
    ('310826', 'AHMAD BIYAMIN BIN ABDUL RAZAK', 'Guru'),
    ('99558', 'AZYUNA BT AZHAR', 'Guru'),
    ('280655', 'WAN MAIZATUL AKHMAR BT WAN MOHAMAD', 'Guru'),
    ('207968', 'AHMAD B HJ. MD NAWI', 'Guru'),
    ('236023', 'AMINATUL JAZILAH BINTI MAT AMIN', 'Guru'),
    ('280613', 'EMMA FITRIYAH BT YUSOFF', 'Guru'),
    ('218261', 'FAIROZ BT MOHAMED', 'Guru'),
    ('263245', 'HAMDAN BIN MOHAMED', 'Guru'),
    ('284240', 'IDA FARIZA BT ABD AZIZ', 'Guru'),
    ('309837', 'MOHAMAD NAZRI BIN MOHAMAD KHATA', 'Guru'),
    ('301592', 'MUHAMMAD SYAZWAN BIN MOHD ZAKI', 'Guru'),
    ('222451', 'NOR AKMAL BINTI ZAWAWI', 'Guru'),
    ('264325', 'NOR HASLINDA BINTI BASRI', 'Guru'),
    ('210722', 'NUR SUHAILA BINTI ABU BAKAR', 'Guru'),
    ('284198', 'NURUL FATIHAH BINTI MOHD RAZALI', 'Guru'),
    ('97327', 'RAHIMAH BINTI ABU BAKAR', 'Guru'),
    ('201278', 'WAN ROSIDA BINTI MAT RASIK', 'Guru'),
    ('290302', 'ZAFIRATUL HUSNA BINTI ARBAIN', 'Guru'),
    ('258849', 'ERMA BT MAT', 'Guru'),
    ('224417', 'AMINUDDEEN BIN MOHAMMAD', 'Guru'),
    ('237514', 'CIK MUNIRAH BT MAT JUSOH', 'Guru'),
    ('210706', 'MASTURA BINTI MAHMUD', 'Guru'),
    ('250083', 'MOHAMAD ALWI BIN ARIFIN', 'Guru'),
    ('280231', 'MOHAMAD BIN ALI', 'Guru'),
    ('292575', 'NURUL KHALISAH BINTI MOHAMMAD', 'Guru'),
    ('258810', 'ROSLI BIN IBRAHIM', 'Guru'),
    ('265586', 'UBAIDILLAH BIN ISMAIL', 'Guru'),
    ('212306', 'MOHD AL FADIL B. RAZAK', 'Guru'),
    ('295310', 'MOHD ASMADI BIN AWANG', 'Guru'),
    ('313506', 'NOR AININA BINTI MOHD MUSTAFA', 'Guru'),
    ('322568', 'NURAISYAH BINTI MOHTAR', 'Guru'),
    ('304984', 'SITI ZUBAIDA BT SAPAR', 'Guru'),
    ('271648', 'SITI ZUBAIDAH BINTI CHE HAT', 'Guru'),
    ('269799', 'NOR HAZLIEN BINTI MOHD SANITU', 'Guru'),
    ('218151', 'ROZITA BINTI AMBAK', 'Guru'),
    ('90874', 'ADNAN BIN AWANG', 'Guru'),
    ('280626', 'AHMAD SYAZWAN B AMIN', 'Guru'),
    ('268729', 'AZURAYANA BINTI SHAARI', 'Guru'),
    ('265874', 'MOHD LUTFI BIN JUSOH', 'Guru'),
    ('272524', 'NUR DIANA BINTI DZURADI', 'Guru'),
    ('256126', 'NUR FARAHIYAH BINTI ZAMRI', 'Guru'),
    ('273523', 'RUZALMY BIN AB. RAHMAN', 'Guru'),
    ('283267', 'NOR ILI BT ISHAK', 'Guru'),
    ('207971', 'NURAZLINA ABDULLAH', 'Guru'),
    ('206228', 'RIZALMAN MOHD NASIR', 'Guru'),
    ('331669', 'SAZARATUL NUR FATIHAH BINYI ZAKARIA', 'Guru'),
    ('276889', 'ASYRAF BIN MUHAMAD', 'Guru'),
    ('250203', 'RAHAYU BINTI AB WAHAB', 'Guru'),
    ('225539', 'SALWANI BT. MUHAMMAD', 'Guru'),
    ('81016', 'AZMAN BIN ABD GHANI', 'Guru'),
    ('211035', 'ASHAR BIN AB. MAJID', 'Guru'),
    ('205805', 'ZULKIFLI BIN YUSOFF', 'Guru'),
    ('97440', 'MOHD NOOR BIN MAHMUD', 'Guru'),
    ('274726', 'NIK MOHD ROSDI BIN NIK MAHMOOD', 'Guru'),
    ('213431', 'TUAN MAT B. NIK SOH', 'Guru'),
    ('276957', 'CHE ASRI BIN ABDUL WAHAB', 'Guru'),
    ('285870', 'AHMAD AIMAN SHAFIQ B. MOHD JAAFAR', 'Guru'),
    ('288738', 'MOHD ROHAIME BIN MA HUSSIN', 'Guru'),
    ('276931', 'MASLIZA BINTI IDRIS', 'Guru'),
    ('218643', 'NOR MAZRAH BINTI MD NASIR', 'Guru'),
    ('276915', 'NURNADIAAIDA BT MOHD ROSDI', 'Guru'),
    ('220783', 'ROSHAIDA BT NOR', 'Guru'),
    ('276902', 'SITI FATEHA BT MAT NOH @ CHE YUNUS', 'Guru'),
    ('276944', 'SUZYLA BT DAUD', 'Guru'),
    ('276928', 'SYARIFUDDIN BIN ABDULLAH', 'Guru'),
    ('219011', 'SAIPUL MIZAN BIN AZAMI', 'Guru'),
    ('281816', 'SYAFAWATI BT ARIFFIN', 'Guru'),
    ('290454', 'SITI NORSHAHIDA BINTI MUHAMMAD', 'Guru'),
    ('262699', 'MOHD JAFRI BIN IDHAM BHARI', 'Guru'),
    ('289928', 'SUHARA NADIA BINTI ABDUL HAMID', 'Guru'),
    ('293082', 'ROZAIHAN BINTI CHE DIN', 'Guru'),
    ('208556', 'RUSLINA BT ISMAIL', 'Guru'),
    ('290629', 'NIK HASNIDA BINTI NIK DAUD', 'Guru'),
    ('243414', 'JUNAIDAH BINTI MD SANGIDIN', 'Guru'),
    ('111111', 'ASMAH BINTI AHMAD HAMBADLEY', 'Guru'),
    ('202468', 'ASMAH BINTI AHMAD HAMBADLEY', 'Guru'),
    ('277422', 'MOHAMAD RIDUAN BIN RAMLI', 'Guru'),
    ('224527', 'MOHD AIRI BIN KAMARUDDIN', 'Guru'),
    ('96713', 'RIDZUAN BIN ISMAIL', 'Guru'),
    ('217217', 'NOAIDA BINTI HASHIM', 'Guru'),
    ('283270', 'HASNIZAM BIN MAT GHANI', 'Guru'),
    ('65427', 'HASNIZAM BIN MAT GHANI', 'Guru'),
    ('209872', 'HASNIZAM BIN MAT GHANI', 'Guru'),
    ('284554', 'HAZIQ SYAZWAN BIN SAJALI', 'Guru'),
    ('86875', 'MOHAMMED NAJIB BIN OTHMAN', 'Guru')
ON CONFLICT (salary_no) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

-- ============================================================
-- BAHAGIAN 4: IMPORT MASTER HOMEROOM (52 REKOD)
-- Relasi advisor_teacher_id diselesaikan melalui salary_no
-- 6 Rekod Discrepancy ditandakan needs_review = true
-- ============================================================
INSERT INTO public.homerooms (form, name, advisor_teacher_id, needs_review) VALUES
    (1, 'CIKGU ADILA', (SELECT id FROM public.teachers WHERE salary_no = '247627'), false),
    (1, 'CIKGU AISAR', (SELECT id FROM public.teachers WHERE salary_no = '331290'), false),
    (1, 'CIKGU AISYAH', (SELECT id FROM public.teachers WHERE salary_no = '322568'), false),
    (1, 'CIKGU ARIFAH', (SELECT id FROM public.teachers WHERE salary_no = '291327'), false),
    (1, 'CIKGU HASLINDA', (SELECT id FROM public.teachers WHERE salary_no = '264325'), false),
    (1, 'CIKGU HAZREEN', (SELECT id FROM public.teachers WHERE salary_no = '208996'), false),
    (1, 'CIKGU ROSIDA', (SELECT id FROM public.teachers WHERE salary_no = '201278'), false),
    (1, 'CIKGU RUHAIDA', (SELECT id FROM public.teachers WHERE salary_no = '268680'), false),
    (1, 'CIKGU SHUKRI', (SELECT id FROM public.teachers WHERE salary_no = '84877'), false),
    (1, 'USTAZ UBAI', (SELECT id FROM public.teachers WHERE salary_no = '265586'), false),
    (2, 'CIKGU ADNAN', (SELECT id FROM public.teachers WHERE salary_no = '90874'), false),
    (2, 'CIKGU ASMADI', (SELECT id FROM public.teachers WHERE salary_no = '295310'), false),
    (2, 'CIKGU AZAM', (SELECT id FROM public.teachers WHERE salary_no = '271253'), true),
    (2, 'CIKGU DIANA', (SELECT id FROM public.teachers WHERE salary_no = '272524'), false),
    (2, 'CIKGU ERMA', (SELECT id FROM public.teachers WHERE salary_no = '258849'), false),
    (2, 'CIKGU FATMAWATI', (SELECT id FROM public.teachers WHERE salary_no = '247630'), false),
    (2, 'CIKGU NOR AKMAL', (SELECT id FROM public.teachers WHERE salary_no = '222451'), false),
    (2, 'CIKGU RAHIMAH', (SELECT id FROM public.teachers WHERE salary_no = '97327'), false),
    (2, 'MISS WANA', (SELECT id FROM public.teachers WHERE salary_no = '213606'), false),
    (2, 'USTAZ MUHAMMAD', (SELECT id FROM public.teachers WHERE salary_no = '280231'), true),
    (3, 'CIKGU AINA', (SELECT id FROM public.teachers WHERE salary_no = '308650'), false),
    (3, 'CIKGU ANIS', (SELECT id FROM public.teachers WHERE salary_no = '960323'), false),
    (3, 'CIKGU FAIROZ', (SELECT id FROM public.teachers WHERE salary_no = '218261'), true),
    (3, 'CIKGU HAFIZAINO', (SELECT id FROM public.teachers WHERE salary_no = '316309'), false),
    (3, 'CIKGU LUTFI', (SELECT id FROM public.teachers WHERE salary_no = '265874'), false),
    (3, 'CIKGU NAZIFAH', (SELECT id FROM public.teachers WHERE salary_no = '283597'), false),
    (3, 'CIKGU NUZULA', (SELECT id FROM public.teachers WHERE salary_no = '212393'), false),
    (3, 'CIKGU SAZA', (SELECT id FROM public.teachers WHERE salary_no = '331669'), true),
    (3, 'CIKGU SHAH', (SELECT id FROM public.teachers WHERE salary_no = '257772'), false),
    (3, 'USTAZAH KHALISA', (SELECT id FROM public.teachers WHERE salary_no = '292575'), false),
    (4, 'CIKGU ANUAR', (SELECT id FROM public.teachers WHERE salary_no = '282187'), false),
    (4, 'CIKGU AZLINA', (SELECT id FROM public.teachers WHERE salary_no = '207971'), true),
    (4, 'CIKGU FARHANA', (SELECT id FROM public.teachers WHERE salary_no = '324553'), false),
    (4, 'CIKGU FARIDAH', (SELECT id FROM public.teachers WHERE salary_no = '210971'), false),
    (4, 'CIKGU FATIHAH', (SELECT id FROM public.teachers WHERE salary_no = '284198'), false),
    (4, 'CIKGU IDA', (SELECT id FROM public.teachers WHERE salary_no = '284240'), false),
    (4, 'CIKGU MAIZATUL', (SELECT id FROM public.teachers WHERE salary_no = '280655'), false),
    (4, 'CIKGU NAZRI', (SELECT id FROM public.teachers WHERE salary_no = '309837'), false),
    (4, 'CIKGU NORMA', (SELECT id FROM public.teachers WHERE salary_no = '201414'), false),
    (4, 'USTAZAH MUNIRAH', (SELECT id FROM public.teachers WHERE salary_no = '237514'), false),
    (5, 'CIKGU ASHRAF', (SELECT id FROM public.teachers WHERE salary_no = '320997'), false),
    (5, 'CIKGU EMMA', (SELECT id FROM public.teachers WHERE salary_no = '280613'), false),
    (5, 'CIKGU FARIZAN', (SELECT id FROM public.teachers WHERE salary_no = '256333'), false),
    (5, 'CIKGU HAZLIEN', (SELECT id FROM public.teachers WHERE salary_no = '269799'), true),
    (5, 'CIKGU NOORZI', (SELECT id FROM public.teachers WHERE salary_no = '200677'), false),
    (5, 'CIKGU RIZALMAN', (SELECT id FROM public.teachers WHERE salary_no = '206228'), false),
    (5, 'CIKGU BIYAMIN', (SELECT id FROM public.teachers WHERE salary_no = '310826'), false),
    (5, 'CIKGU SURIANA', (SELECT id FROM public.teachers WHERE salary_no = '242017'), false),
    (5, 'CIKGU SYARIFUAD', (SELECT id FROM public.teachers WHERE salary_no = '291071'), false),
    (5, 'MADAM HAS', (SELECT id FROM public.teachers WHERE salary_no = '92652'), false),
    (5, 'SIR M', (SELECT id FROM public.teachers WHERE salary_no = '282718'), false),
    (5, 'USTAZ ROSLI', (SELECT id FROM public.teachers WHERE salary_no = '258810'), false)
ON CONFLICT (form, name) DO UPDATE SET
    advisor_teacher_id = EXCLUDED.advisor_teacher_id,
    needs_review = EXCLUDED.needs_review,
    updated_at = now();

-- ============================================================
-- BAHAGIAN 5: VERIFIKASI SELEPAS IMPORT
-- ============================================================
SELECT 'Jumlah Guru' AS entity, count(*) AS count FROM public.teachers
UNION ALL
SELECT 'Jumlah Homeroom' AS entity, count(*) AS count FROM public.homerooms
UNION ALL
SELECT 'Homeroom Perlu Semakan (needs_review = true)' AS entity, count(*) AS count FROM public.homerooms WHERE needs_review = true
UNION ALL
SELECT 'Penasihat Berjaya Diselesaikan' AS entity, count(*) AS count FROM public.homerooms WHERE advisor_teacher_id IS NOT NULL;
