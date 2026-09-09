import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read credentials from .env.local
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if ((!supabaseUrl || !supabaseKey) && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    }
    if (!supabaseKey && trimmed.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) {
      supabaseKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=", "").trim();
    }
    if (!supabaseKey && trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
    }
  }
}

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

async function main() {
  console.log("==================================================");
  console.log("IMPORT MASTER DATA — MRSM TUMPAT 2026");
  console.log("==================================================");

  if (!supabaseUrl || !supabaseKey) {
    console.error("Ralat: Tiada kredensial Supabase dijumpai di .env.local.");
    process.exit(1);
  }

  console.log(`Menyambung ke Supabase: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const dataDir = path.join(process.cwd(), "data");
  const teachersPath = path.join(dataDir, "supabase_teachers_import.csv");
  const homeroomsPath = path.join(dataDir, "supabase_homerooms_import.csv");
  const reviewPath = path.join(dataDir, "supabase_master_data_review.csv");

  if (!fs.existsSync(teachersPath) || !fs.existsSync(homeroomsPath)) {
    console.error("Ralat: Fail CSV master data tidak dijumpai di direktori data/.");
    process.exit(1);
  }

  const teachersParsed = parseCSV(fs.readFileSync(teachersPath, "utf8"));
  const homeroomsParsed = parseCSV(fs.readFileSync(homeroomsPath, "utf8"));
  const reviewParsed = fs.existsSync(reviewPath)
    ? parseCSV(fs.readFileSync(reviewPath, "utf8"))
    : [];

  const reviewSet = new Set<string>();
  reviewParsed.slice(1).forEach((r) => {
    reviewSet.add(`${r[0]}-${r[1]}`);
  });

  const teacherRecords = teachersParsed.slice(1).map((r) => ({
    salary_no: r[0].trim(),
    name: r[1].trim(),
    role: r[2]?.trim() || "Guru",
  }));

  console.log(`\n1. Memproses ${teacherRecords.length} Master Guru...`);

  // Check if teachers table exists
  const { error: testError } = await supabase.from("teachers").select("id").limit(1);
  if (testError && testError.code === "PGRST205") {
    console.error("\n❌ RALAT: Jadual 'public.teachers' belum wujud di Supabase.");
    console.error("Sila jalankan skrip SQL terlebih dahulu di Supabase SQL Editor:");
    console.error("Fail: supabase/supabase_bulk_import_teachers_homerooms.sql\n");
    process.exit(1);
  }

  // Fetch existing teachers to calculate created vs updated
  const { data: existingTeachers } = await supabase
    .from("teachers")
    .select("id, salary_no");

  const existingSalaryMap = new Map<string, string>();
  (existingTeachers || []).forEach((t: { id: string; salary_no: string }) => {
    existingSalaryMap.set(t.salary_no.trim(), t.id);
  });

  let teachersCreated = 0;
  let teachersUpdated = 0;
  let teachersSkipped = 0;

  for (const t of teacherRecords) {
    if (existingSalaryMap.has(t.salary_no)) {
      const { error } = await supabase
        .from("teachers")
        .update({ name: t.name, role: t.role, updated_at: new Date().toISOString() })
        .eq("salary_no", t.salary_no);
      if (error) {
        console.error(`Gagal kemaskini guru ${t.salary_no}:`, error.message);
        teachersSkipped++;
      } else {
        teachersUpdated++;
      }
    } else {
      const { error } = await supabase.from("teachers").insert([t]);
      if (error) {
        console.error(`Gagal masukkan guru ${t.salary_no}:`, error.message);
        teachersSkipped++;
      } else {
        teachersCreated++;
      }
    }
  }

  console.log(`Guru Selesai: Created: ${teachersCreated}, Updated: ${teachersUpdated}, Skipped: ${teachersSkipped}`);

  // Fetch full teacher map for homeroom advisor resolution
  const { data: allTeachers } = await supabase.from("teachers").select("id, salary_no");
  const teacherIdMap = new Map<string, string>();
  (allTeachers || []).forEach((t: { id: string; salary_no: string }) => {
    teacherIdMap.set(t.salary_no.trim(), t.id);
  });

  console.log(`\n2. Memproses Homeroom (52 rekod)...`);

  const { data: existingHomerooms } = await supabase
    .from("homerooms")
    .select("id, form, name");

  const existingHomeroomMap = new Map<string, string>();
  (existingHomerooms || []).forEach((h: { id: string; form: number; name: string }) => {
    existingHomeroomMap.set(`${h.form}-${h.name}`, h.id);
  });

  let homeroomsCreated = 0;
  let homeroomsUpdated = 0;
  let homeroomsSkipped = 0;
  let advisorResolved = 0;
  let recordsRequiringReview = 0;

  for (const row of homeroomsParsed.slice(1)) {
    const form = Number(row[0]);
    const homeroomName = row[1].trim();
    const advisorSalaryNo = row[3]?.trim();
    const key = `${form}-${homeroomName}`;
    const needsReview = row[4] === "true" || reviewSet.has(key);

    if (needsReview) {
      recordsRequiringReview++;
    }

    const advisorTeacherId = advisorSalaryNo ? teacherIdMap.get(advisorSalaryNo) || null : null;
    if (advisorTeacherId) {
      advisorResolved++;
    } else if (advisorSalaryNo) {
      console.warn(`Amaran: Penasihat nombor gaji ${advisorSalaryNo} bagi ${form} ${homeroomName} tidak ditemui.`);
    }

    const homeroomData = {
      form,
      name: homeroomName,
      advisor_teacher_id: advisorTeacherId,
      needs_review: needsReview,
      updated_at: new Date().toISOString(),
    };

    if (existingHomeroomMap.has(key)) {
      const { error } = await supabase
        .from("homerooms")
        .update(homeroomData)
        .eq("form", form)
        .eq("name", homeroomName);
      if (error) {
        console.error(`Gagal kemaskini homeroom ${key}:`, error.message);
        homeroomsSkipped++;
      } else {
        homeroomsUpdated++;
      }
    } else {
      const { error } = await supabase.from("homerooms").insert([homeroomData]);
      if (error) {
        console.error(`Gagal masukkan homeroom ${key}:`, error.message);
        homeroomsSkipped++;
      } else {
        homeroomsCreated++;
      }
    }
  }

  console.log("\n==================================================");
  console.log("LAPORAN AKHIR IMPORT MASTER DATA");
  console.log("==================================================");
  console.log(`Teachers created: ${teachersCreated}`);
  console.log(`Teachers updated: ${teachersUpdated}`);
  console.log(`Teachers skipped: ${teachersSkipped}`);
  console.log("");
  console.log(`Homerooms created: ${homeroomsCreated}`);
  console.log(`Homerooms updated: ${homeroomsUpdated}`);
  console.log(`Homerooms skipped: ${homeroomsSkipped}`);
  console.log("");
  console.log(`Advisor relationships resolved: ${advisorResolved}`);
  console.log(`Records requiring review: ${recordsRequiringReview}`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Ralat pelaksanaan import:", err);
  process.exit(1);
});
