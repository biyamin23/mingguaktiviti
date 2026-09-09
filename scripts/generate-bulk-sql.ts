import fs from "fs";
import path from "path";

interface TeacherRow {
  salary_no: string;
  name: string;
  role: string;
}

interface HomeroomRow {
  form: number;
  homeroom_name: string;
  advisor_name: string;
  advisor_salary_no: string;
  needs_review: boolean;
  source_salary_no: string;
}

interface ReviewRow {
  form: number;
  homeroom_name: string;
  advisor_name_source: string;
  salary_no_in_homeroom_sheet: string;
  matched_teacher_name: string;
  salary_no_in_teacher_master: string;
  match_score: string;
  issue: string;
}

function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    // Simple CSV parse handling comma separation
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  });
}

function run() {
  const dataDir = path.join(process.cwd(), "data");

  const teachersRaw = fs.readFileSync(path.join(dataDir, "supabase_teachers_import.csv"), "utf8");
  const homeroomsRaw = fs.readFileSync(path.join(dataDir, "supabase_homerooms_import.csv"), "utf8");
  const reviewRaw = fs.readFileSync(path.join(dataDir, "supabase_master_data_review.csv"), "utf8");

  const teachersParsed = parseCSV(teachersRaw);
  const homeroomsParsed = parseCSV(homeroomsRaw);
  const reviewParsed = parseCSV(reviewRaw);

  const teacherRows: TeacherRow[] = teachersParsed.slice(1).map((r) => ({
    salary_no: r[0],
    name: r[1],
    role: r[2] || "Guru",
  }));

  const reviewMap = new Map<string, ReviewRow>();
  reviewParsed.slice(1).forEach((r) => {
    const key = `${r[0]}-${r[1]}`;
    reviewMap.set(key, {
      form: Number(r[0]),
      homeroom_name: r[1],
      advisor_name_source: r[2],
      salary_no_in_homeroom_sheet: r[3],
      matched_teacher_name: r[4],
      salary_no_in_teacher_master: r[5],
      match_score: r[6],
      issue: r[7],
    });
  });

  const homeroomRows: HomeroomRow[] = homeroomsParsed.slice(1).map((r) => {
    const form = Number(r[0]);
    const homeroom_name = r[1];
    const key = `${form}-${homeroom_name}`;
    const isReview = r[4] === "true" || reviewMap.has(key);
    return {
      form,
      homeroom_name,
      advisor_name: r[2],
      advisor_salary_no: r[3],
      needs_review: isReview,
      source_salary_no: r[5] || r[3],
    };
  });

  console.log(`Parsed ${teacherRows.length} teachers.`);
  console.log(`Parsed ${homeroomRows.length} homerooms.`);
  console.log(`Identified ${reviewMap.size} review records from review CSV.`);

  // Check teacher salary numbers uniqueness
  const teacherSalarySet = new Set<string>();
  const duplicateSalaries: string[] = [];
  teacherRows.forEach((t) => {
    if (teacherSalarySet.has(t.salary_no)) {
      duplicateSalaries.push(t.salary_no);
    }
    teacherSalarySet.add(t.salary_no);
  });
  console.log(`Unique teacher salary numbers: ${teacherSalarySet.size}, Duplicates:`, duplicateSalaries);

  // Check homeroom advisors against teacher master
  let resolvedAdvisors = 0;
  let unresolvedAdvisors = 0;
  homeroomRows.forEach((h) => {
    if (teacherSalarySet.has(h.advisor_salary_no)) {
      resolvedAdvisors++;
    } else {
      unresolvedAdvisors++;
      console.warn(`Unresolved advisor salary ${h.advisor_salary_no} for homeroom ${h.form} ${h.homeroom_name}`);
    }
  });

  console.log(`Homeroom advisors resolved: ${resolvedAdvisors}/${homeroomRows.length}, Unresolved: ${unresolvedAdvisors}`);

  // Build the SQL file
  let sql = `-- ============================================================
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
INSERT INTO public.teachers (salary_no, name, role) VALUES\n`;

  const teacherSqlValues = teacherRows.map((t) => {
    const escapedName = t.name.replace(/'/g, "''");
    const escapedRole = t.role.replace(/'/g, "''");
    return `    ('${t.salary_no}', '${escapedName}', '${escapedRole}')`;
  });

  sql += teacherSqlValues.join(",\n");
  sql += `\nON CONFLICT (salary_no) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();\n\n`;

  sql += `-- ============================================================
-- BAHAGIAN 4: IMPORT MASTER HOMEROOM (52 REKOD)
-- Relasi advisor_teacher_id diselesaikan melalui salary_no
-- 6 Rekod Discrepancy ditandakan needs_review = true
-- ============================================================
INSERT INTO public.homerooms (form, name, advisor_teacher_id, needs_review) VALUES\n`;

  const homeroomSqlValues = homeroomRows.map((h) => {
    const escapedName = h.homeroom_name.replace(/'/g, "''");
    const advisorSubquery = `(SELECT id FROM public.teachers WHERE salary_no = '${h.advisor_salary_no}')`;
    return `    (${h.form}, '${escapedName}', ${advisorSubquery}, ${h.needs_review})`;
  });

  sql += homeroomSqlValues.join(",\n");
  sql += `\nON CONFLICT (form, name) DO UPDATE SET
    advisor_teacher_id = EXCLUDED.advisor_teacher_id,
    needs_review = EXCLUDED.needs_review,
    updated_at = now();\n\n`;

  sql += `-- ============================================================
-- BAHAGIAN 5: VERIFIKASI SELEPAS IMPORT
-- ============================================================
SELECT 'Jumlah Guru' AS entity, count(*) AS count FROM public.teachers
UNION ALL
SELECT 'Jumlah Homeroom' AS entity, count(*) AS count FROM public.homerooms
UNION ALL
SELECT 'Homeroom Perlu Semakan (needs_review = true)' AS entity, count(*) AS count FROM public.homerooms WHERE needs_review = true
UNION ALL
SELECT 'Penasihat Berjaya Diselesaikan' AS entity, count(*) AS count FROM public.homerooms WHERE advisor_teacher_id IS NOT NULL;
`;

  const outputPath = path.join(process.cwd(), "supabase", "supabase_bulk_import_teachers_homerooms.sql");
  fs.writeFileSync(outputPath, sql, "utf8");
  console.log(`Generated ${outputPath} successfully (${sql.length} bytes).`);
}

run();
