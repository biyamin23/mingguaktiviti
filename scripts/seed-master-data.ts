/**
 * ============================================================
 * PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026
 * Master Data Seeding & Safe Import CLI Script
 * File: scripts/seed-master-data.ts
 * ============================================================
 * 
 * Usage:
 *   npx ts-node scripts/seed-master-data.ts [optional-csv-or-json-path]
 */

import * as fs from 'fs';
import { MasterDataRow, processMasterData } from '../lib/validation/master-data';

// Default Authoritative Sample Dataset matching MRSM Tumpat Structure
const DEFAULT_SOURCE_DATA: MasterDataRow[] = [
  // Tingkatan 1
  { form: 1, homeroom_name: '1 Al-Farabi', teacher_name: 'Ustazah Siti Aminah binti Razak', salary_no: 'G1002' },
  { form: 1, homeroom_name: '1 Ibn Sina', teacher_name: 'Cikgu Mohd Danial bin Hashim', salary_no: 'G1003' },
  { form: 1, homeroom_name: '1 Al-Biruni', teacher_name: 'Cikgu Wan Azura binti Wan Daud', salary_no: 'G1014' },
  { form: 1, homeroom_name: '1 Al-Khawarizmi', teacher_name: 'Cikgu Ahmad Syakir bin Yusof', salary_no: 'G1015' },
  { form: 1, homeroom_name: '1 Al-Razi', teacher_name: 'Cikgu Nur Fadhilah binti Ismail', salary_no: 'G1016' },
  { form: 1, homeroom_name: '1 Ibn Khaldun', teacher_name: 'Cikgu Muhammad Firdaus bin Rosli', salary_no: 'G1017' },

  // Tingkatan 2
  { form: 2, homeroom_name: '2 Al-Farabi', teacher_name: 'Cikgu Nurul Huda binti Othman', salary_no: 'G1004' },
  { form: 2, homeroom_name: '2 Ibn Sina', teacher_name: 'Cikgu Khairul Anuar bin Salleh', salary_no: 'G1005' },
  { form: 2, homeroom_name: '2 Al-Biruni', teacher_name: 'Cikgu Siti Maryam binti Che Mat', salary_no: 'G1018' },
  { form: 2, homeroom_name: '2 Al-Khawarizmi', teacher_name: 'Cikgu Kamaruzzaman bin Hassan', salary_no: 'G1019' },
  { form: 2, homeroom_name: '2 Al-Razi', teacher_name: 'Cikgu Che Rohani binti Yaacob', salary_no: 'G1020' },
  { form: 2, homeroom_name: '2 Ibn Khaldun', teacher_name: 'Cikgu Roslan bin Abdul Rahman', salary_no: 'G1021' },

  // Tingkatan 3
  { form: 3, homeroom_name: '3 Al-Farabi', teacher_name: 'Cikgu Wan Noraini binti Wan Ismail', salary_no: 'G1006' },
  { form: 3, homeroom_name: '3 Ibn Sina', teacher_name: 'Cikgu Muhammad Faiz bin Azman', salary_no: 'G1007' },
  { form: 3, homeroom_name: '3 Al-Biruni', teacher_name: 'Cikgu Noraini binti Mustapha', salary_no: 'G1022' },
  { form: 3, homeroom_name: '3 Al-Khawarizmi', teacher_name: 'Cikgu Nik Zulkifli bin Nik Hassan', salary_no: 'G1023' },
  { form: 3, homeroom_name: '3 Al-Razi', teacher_name: 'Cikgu Fatin Nabilah binti Mohamad', salary_no: 'G1024' },
  { form: 3, homeroom_name: '3 Ibn Khaldun', teacher_name: 'Cikgu Azhar bin Mat Zin', salary_no: 'G1025' },

  // Tingkatan 4
  { form: 4, homeroom_name: '4 Al-Farabi', teacher_name: 'Cikgu Nor Asyikin binti Mat Zin', salary_no: 'G1008' },
  { form: 4, homeroom_name: '4 Ibn Sina', teacher_name: 'Cikgu Hafiz bin Abdullah', salary_no: 'G1009' },
  { form: 4, homeroom_name: '4 Al-Biruni', teacher_name: 'Cikgu Farah Nadia binti Zahari', salary_no: 'G1026' },
  { form: 4, homeroom_name: '4 Al-Khawarizmi', teacher_name: 'Cikgu Mohd Tarmizi bin Idris', salary_no: 'G1027' },
  { form: 4, homeroom_name: '4 Al-Razi', teacher_name: 'Cikgu Norazlina binti Sulaiman', salary_no: 'G1028' },
  { form: 4, homeroom_name: '4 Ibn Khaldun', teacher_name: 'Cikgu Zulkarnain bin Ghazali', salary_no: 'G1029' },

  // Tingkatan 5 (Tiada pertandingan, tetapi ada homeroom)
  { form: 5, homeroom_name: '5 Al-Farabi', teacher_name: 'Cikgu Rozita binti Ramli', salary_no: 'G1010' },
  { form: 5, homeroom_name: '5 Ibn Sina', teacher_name: 'Cikgu Ahmad Faris bin Zulkifli', salary_no: 'G1001' },
  { form: 5, homeroom_name: '5 Al-Biruni', teacher_name: 'Cikgu Maznah binti Alias', salary_no: 'G1030' },
];

// Standalone execution runner
if (require.main === module) {
  console.log('============================================================');
  console.log('PORTAL MINGGU AKTIVITI MRSM TUMPAT 2026 — MASTER DATA IMPORT');
  console.log('============================================================\n');

  const args = process.argv.slice(2);
  let dataset = DEFAULT_SOURCE_DATA;

  if (args.length > 0 && fs.existsSync(args[0])) {
    console.log(`Membaca fail sumber luaran: ${args[0]}`);
    try {
      const content = fs.readFileSync(args[0], 'utf-8');
      if (args[0].endsWith('.json')) {
        dataset = JSON.parse(content);
      } else if (args[0].endsWith('.csv')) {
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        dataset = lines.slice(1).map(l => {
          const cols = l.split(',').map(c => c.trim());
          return {
            form: parseInt(cols[0], 10),
            homeroom_name: cols[1],
            teacher_name: cols[2],
            salary_no: cols[3],
          };
        });
      }
    } catch (e: any) {
      console.error('Ralat membaca fail:', e.message);
      process.exit(1);
    }
  } else {
    console.log('Menggunakan set data autoritatif asal MRSM Tumpat (Tingkatan 1–5).');
  }

  console.log(`Jumlah baris data: ${dataset.length}\n`);
  const result = processMasterData(dataset);

  console.log('--- RINGKASAN IMPORT (IMPORT SUMMARY) ---');
  console.log(`✓ Guru Ditambah: ${result.createdTeachers}`);
  console.log(`✓ Homeroom Ditambah: ${result.createdHomerooms}`);
  console.log(`⚠ Perlu Semakan Data: ${result.needsReview}`);
  console.log(`- Dilangkau (Skipped): ${result.skipped}\n`);

  if (result.issues.length > 0) {
    console.log('--- SENARAI REKOD PERLU SEMAKAN DATA ---');
    result.issues.forEach(iss => {
      console.log(`Baris ${iss.row}: [T${iss.data.form}] ${iss.data.homeroom_name} | Guru: ${iss.data.teacher_name} (${iss.data.salary_no})`);
      console.log(`   -> SEBAB: ${iss.reason}`);
    });
    console.log('\nSila betulkan data sumber sebelum mengimport ke pengeluaran.');
  } else {
    console.log('Semua rekod sah dan menepati integriti sistem!');
  }
}
