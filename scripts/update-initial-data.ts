import fs from "fs";
import path from "path";

function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
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

function updateInitialData() {
  const dataDir = path.join(process.cwd(), "data");
  const teachersParsed = parseCSV(fs.readFileSync(path.join(dataDir, "supabase_teachers_import.csv"), "utf8"));
  const homeroomsParsed = parseCSV(fs.readFileSync(path.join(dataDir, "supabase_homerooms_import.csv"), "utf8"));
  const reviewParsed = parseCSV(fs.readFileSync(path.join(dataDir, "supabase_master_data_review.csv"), "utf8"));

  const reviewSet = new Set<string>();
  reviewParsed.slice(1).forEach((r) => {
    reviewSet.add(`${r[0]}-${r[1]}`);
  });

  const teachers = teachersParsed.slice(1).map((r, idx) => ({
    id: `t-${idx + 101}`,
    salary_no: r[0].trim(),
    name: r[1].trim(),
    role: r[2]?.trim() || "Guru",
  }));

  const salaryToIdMap = new Map<string, string>();
  teachers.forEach((t) => salaryToIdMap.set(t.salary_no, t.id));

  const homerooms = homeroomsParsed.slice(1).map((r, idx) => {
    const form = Number(r[0]);
    const name = r[1].trim();
    const advisor_salary_no = r[3]?.trim();
    const key = `${form}-${name}`;
    const needs_review = r[4] === "true" || reviewSet.has(key);
    const advisor_teacher_id = advisor_salary_no ? salaryToIdMap.get(advisor_salary_no) || null : null;

    return {
      id: `hr-${form}${String(idx + 1).padStart(2, "0")}`,
      form,
      name,
      advisor_teacher_id,
      needs_review,
    };
  });

  const code = `import { Teacher, Homeroom, Competition, MeritSetting, ScheduleSlot } from '@/types/database';

export const INITIAL_MERIT_SETTINGS: MeritSetting[] = [
  { id: '1', placement: 'Johan', points: 100 },
  { id: '2', placement: 'Naib Johan', points: 70 },
  { id: '3', placement: 'Ketiga', points: 40 },
  { id: '4', placement: 'Keempat', points: 30 },
  { id: '5', placement: 'Kelima', points: 20 },
  { id: '6', placement: 'Penyertaan', points: 10 },
];

export const INITIAL_TEACHERS: Teacher[] = ${JSON.stringify(teachers, null, 2)};

export const INITIAL_HOMEROOMS: Homeroom[] = ${JSON.stringify(homerooms, null, 2)};

export const INITIAL_COMPETITIONS: Competition[] = [
  // Tingkatan 1 (Known official competitions)
  { id: 'c-101', name: 'Pementasan Cerpen', form: 1, pic_teacher_id: '${teachers[0]?.id || ""}' },
  { id: 'c-102', name: 'Newspaper Scavenger Hunt', form: 1, pic_teacher_id: '${teachers[1]?.id || ""}' },
  { id: 'c-103', name: 'Slot Motivasi', form: 1, pic_teacher_id: '${teachers[0]?.id || ""}' },
  { id: 'c-104', name: 'Misi Menakluk al Gebra', form: 1, pic_teacher_id: '${teachers[2]?.id || ""}' },
  { id: 'c-105', name: 'Slot Malam Citrawarna', form: 1, pic_teacher_id: '${teachers[3]?.id || ""}' },

  // Tingkatan 2 (Known official competitions)
  { id: 'c-201', name: 'Slot Motivasi', form: 2, pic_teacher_id: '${teachers[0]?.id || ""}' },
  { id: 'c-202', name: 'Slot Malam Citrawarna', form: 2, pic_teacher_id: '${teachers[3]?.id || ""}' },

  // Tingkatan 3 (Known official competitions)
  { id: 'c-301', name: 'Aesira My Challenge (Giant Volleyball Challenge)', form: 3, pic_teacher_id: '${teachers[4]?.id || ""}' },
  { id: 'c-302', name: 'Aesira My Challenge (My Mission Malaysia)', form: 3, pic_teacher_id: '${teachers[4]?.id || ""}' },
  { id: 'c-303', name: 'Slot RBT', form: 3, pic_teacher_id: '${teachers[2]?.id || ""}' },
  { id: 'c-304', name: 'Slot Sejarah', form: 3, pic_teacher_id: '${teachers[3]?.id || ""}' },
  { id: 'c-305', name: 'Slot Malam Citrawarna', form: 3, pic_teacher_id: '${teachers[3]?.id || ""}' },

  // Tingkatan 4 (Tiada pertandingan rekaan; ditambah melalui Data Master)
  // Tingkatan 5 (TIADA PERTANDINGAN SAMA SEKALI)
];

export const INITIAL_SCHEDULE_SLOTS: ScheduleSlot[] = [
  // 13 September 2026
  {
    id: 's-101',
    title: 'Slot Motivasi Kecemerlangan',
    date: '2026-09-13',
    start_time: '08:00',
    end_time: '10:00',
    pic_teacher_id: '${teachers[0]?.id || ""}',
    targets: [{ form: 1 }, { form: 2 }]
  },
  {
    id: 's-102',
    title: 'Pementasan Cerpen',
    date: '2026-09-13',
    start_time: '10:30',
    end_time: '12:30',
    pic_teacher_id: '${teachers[1]?.id || ""}',
    targets: [{ form: 1 }]
  },
  {
    id: 's-103',
    title: 'Aesira My Challenge (Giant Volleyball)',
    date: '2026-09-13',
    start_time: '14:30',
    end_time: '16:30',
    pic_teacher_id: '${teachers[4]?.id || ""}',
    targets: [{ form: 3 }]
  },
  {
    id: 's-104',
    title: 'Malam Citrawarna MRSM Tumpat',
    date: '2026-09-13',
    start_time: '20:30',
    end_time: '22:30',
    pic_teacher_id: '${teachers[3]?.id || ""}',
    targets: [{ form: 1 }, { form: 2 }, { form: 3 }]
  }
];
`;

  fs.writeFileSync(path.join(process.cwd(), "lib", "data", "initial-data.ts"), code, "utf8");
  console.log("Updated lib/data/initial-data.ts with 147 teachers and 52 homerooms.");
}

updateInitialData();
