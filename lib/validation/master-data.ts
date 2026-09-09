// ============================================================
// Master Data Processing & Validation Logic (Pure TypeScript)
// ============================================================

export interface MasterDataRow {
  form: number;
  homeroom_name: string;
  teacher_name: string;
  salary_no: string;
}

export interface ImportSummary {
  createdTeachers: number;
  updatedTeachers: number;
  createdHomerooms: number;
  updatedHomerooms: number;
  skipped: number;
  needsReview: number;
  issues: {
    row: number;
    data: any;
    reason: string;
  }[];
}

export function processMasterData(rows: MasterDataRow[]): ImportSummary {
  const summary: ImportSummary = {
    createdTeachers: 0,
    updatedTeachers: 0,
    createdHomerooms: 0,
    updatedHomerooms: 0,
    skipped: 0,
    needsReview: 0,
    issues: [],
  };

  const seenSalaryNos = new Map<string, string>(); // salary_no -> teacher_name
  const seenAdvisors = new Set<string>(); // salary_no used as advisor

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const cleanSalary = (row.salary_no || '').trim().toUpperCase();
    const cleanTeacher = (row.teacher_name || '').trim();
    const cleanHomeroom = (row.homeroom_name || '').trim();
    const formNum = Number(row.form);

    // 1. Validate Form Range
    if (isNaN(formNum) || formNum < 1 || formNum > 5) {
      summary.needsReview++;
      summary.issues.push({
        row: rowNum,
        data: row,
        reason: 'Tingkatan tidak sah (Mesti antara 1 hingga 5).'
      });
      return;
    }

    // 2. Validate Homeroom Name
    if (!cleanHomeroom) {
      summary.needsReview++;
      summary.issues.push({
        row: rowNum,
        data: row,
        reason: 'Nama homeroom tiada atau kosong.'
      });
      return;
    }

    // 3. Check Missing Salary Number
    if (!cleanSalary) {
      summary.needsReview++;
      summary.issues.push({
        row: rowNum,
        data: row,
        reason: 'Nombor gaji guru tiada (Perlu Semakan Data).'
      });
      return;
    }

    // 4. Check Duplicate Salary Number for different teacher names
    if (seenSalaryNos.has(cleanSalary)) {
      const existingName = seenSalaryNos.get(cleanSalary);
      if (existingName?.toLowerCase() !== cleanTeacher.toLowerCase()) {
        summary.needsReview++;
        summary.issues.push({
          row: rowNum,
          data: row,
          reason: `Nombor gaji ${cleanSalary} bertindih antara "${existingName}" dan "${cleanTeacher}".`
        });
        return;
      }
    } else {
      seenSalaryNos.set(cleanSalary, cleanTeacher);
    }

    // 5. Check Single Advisor per Homeroom
    if (seenAdvisors.has(cleanSalary)) {
      summary.needsReview++;
      summary.issues.push({
        row: rowNum,
        data: row,
        reason: `Guru ${cleanTeacher} (${cleanSalary}) telah ditugaskan kepada lebih daripada satu homeroom.`
      });
      return;
    }
    seenAdvisors.add(cleanSalary);

    // Passed integrity checks
    summary.createdTeachers++;
    summary.createdHomerooms++;
  });

  return summary;
}
