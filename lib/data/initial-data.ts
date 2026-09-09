import { Teacher, Homeroom, Competition, MeritSetting, ScheduleSlot } from '@/types/database';

export const INITIAL_MERIT_SETTINGS: MeritSetting[] = [
  { id: '1', placement: 'Johan', points: 100 },
  { id: '2', placement: 'Naib Johan', points: 70 },
  { id: '3', placement: 'Ketiga', points: 40 },
  { id: '4', placement: 'Keempat', points: 30 },
  { id: '5', placement: 'Kelima', points: 20 },
  { id: '6', placement: 'Penyertaan', points: 10 },
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 't-101', salary_no: 'G1001', name: 'Cikgu Ahmad Faris bin Zulkifli', role: 'Penyelaras Minggu Aktiviti' },
  { id: 't-102', salary_no: 'G1002', name: 'Ustazah Siti Aminah binti Razak', role: 'Penasihat Homeroom T1' },
  { id: 't-103', salary_no: 'G1003', name: 'Cikgu Mohd Danial bin Hashim', role: 'Penasihat Homeroom T1' },
  { id: 't-104', salary_no: 'G1004', name: 'Cikgu Nurul Huda binti Othman', role: 'Penasihat Homeroom T2' },
  { id: 't-105', salary_no: 'G1005', name: 'Cikgu Khairul Anuar bin Salleh', role: 'Penasihat Homeroom T2' },
  { id: 't-106', salary_no: 'G1006', name: 'Cikgu Wan Noraini binti Wan Ismail', role: 'Penasihat Homeroom T3' },
  { id: 't-107', salary_no: 'G1007', name: 'Cikgu Muhammad Faiz bin Azman', role: 'Penasihat Homeroom T3' },
  { id: 't-108', salary_no: 'G1008', name: 'Cikgu Nor Asyikin binti Mat Zin', role: 'Penasihat Homeroom T4' },
  { id: 't-109', salary_no: 'G1009', name: 'Cikgu Hafiz bin Abdullah', role: 'Penasihat Homeroom T4' },
  { id: 't-110', salary_no: 'G1010', name: 'Cikgu Rozita binti Ramli', role: 'Penasihat Homeroom T5' },
  { id: 't-111', salary_no: 'G1011', name: 'Cikgu Azman bin Ibrahim', role: 'Ketua Bidang Bahasa' },
  { id: 't-112', salary_no: 'G1012', name: 'Cikgu Zulaikha binti Mustafa', role: 'Ketua Bidang Sains & Matematik' },
  { id: 't-113', salary_no: 'G1013', name: 'Cikgu Syahrul bin Jaafar', role: 'Ketua Bidang Kemanusiaan' },
];

export const INITIAL_HOMEROOMS: Homeroom[] = [
  // Tingkatan 1
  { id: 'hr-101', form: 1, name: '1 Al-Farabi', advisor_teacher_id: 't-102', needs_review: false },
  { id: 'hr-102', form: 1, name: '1 Ibn Sina', advisor_teacher_id: 't-103', needs_review: false },
  { id: 'hr-103', form: 1, name: '1 Al-Biruni', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-104', form: 1, name: '1 Al-Khawarizmi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-105', form: 1, name: '1 Al-Razi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-106', form: 1, name: '1 Ibn Khaldun', advisor_teacher_id: null, needs_review: false },

  // Tingkatan 2
  { id: 'hr-201', form: 2, name: '2 Al-Farabi', advisor_teacher_id: 't-104', needs_review: false },
  { id: 'hr-202', form: 2, name: '2 Ibn Sina', advisor_teacher_id: 't-105', needs_review: false },
  { id: 'hr-203', form: 2, name: '2 Al-Biruni', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-204', form: 2, name: '2 Al-Khawarizmi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-205', form: 2, name: '2 Al-Razi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-206', form: 2, name: '2 Ibn Khaldun', advisor_teacher_id: null, needs_review: false },

  // Tingkatan 3
  { id: 'hr-301', form: 3, name: '3 Al-Farabi', advisor_teacher_id: 't-106', needs_review: false },
  { id: 'hr-302', form: 3, name: '3 Ibn Sina', advisor_teacher_id: 't-107', needs_review: false },
  { id: 'hr-303', form: 3, name: '3 Al-Biruni', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-304', form: 3, name: '3 Al-Khawarizmi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-305', form: 3, name: '3 Al-Razi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-306', form: 3, name: '3 Ibn Khaldun', advisor_teacher_id: null, needs_review: false },

  // Tingkatan 4
  { id: 'hr-401', form: 4, name: '4 Al-Farabi', advisor_teacher_id: 't-108', needs_review: false },
  { id: 'hr-402', form: 4, name: '4 Ibn Sina', advisor_teacher_id: 't-109', needs_review: false },
  { id: 'hr-403', form: 4, name: '4 Al-Biruni', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-404', form: 4, name: '4 Al-Khawarizmi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-405', form: 4, name: '4 Al-Razi', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-406', form: 4, name: '4 Ibn Khaldun', advisor_teacher_id: null, needs_review: false },

  // Tingkatan 5 (Tiada pertandingan, tetapi mempunyai homeroom)
  { id: 'hr-501', form: 5, name: '5 Al-Farabi', advisor_teacher_id: 't-110', needs_review: false },
  { id: 'hr-502', form: 5, name: '5 Ibn Sina', advisor_teacher_id: null, needs_review: false },
  { id: 'hr-503', form: 5, name: '5 Al-Biruni', advisor_teacher_id: null, needs_review: false },
];

export const INITIAL_COMPETITIONS: Competition[] = [
  // Tingkatan 1 (Known official competitions)
  { id: 'c-101', name: 'Pementasan Cerpen', form: 1, pic_teacher_id: 't-111' },
  { id: 'c-102', name: 'Newspaper Scavenger Hunt', form: 1, pic_teacher_id: 't-111' },
  { id: 'c-103', name: 'Slot Motivasi', form: 1, pic_teacher_id: 't-101' },
  { id: 'c-104', name: 'Misi Menakluk al Gebra', form: 1, pic_teacher_id: 't-112' },
  { id: 'c-105', name: 'Slot Malam Citrawarna', form: 1, pic_teacher_id: 't-113' },

  // Tingkatan 2 (Known official competitions)
  { id: 'c-201', name: 'Slot Motivasi', form: 2, pic_teacher_id: 't-101' },
  { id: 'c-202', name: 'Slot Malam Citrawarna', form: 2, pic_teacher_id: 't-113' },

  // Tingkatan 3 (Known official competitions)
  { id: 'c-301', name: 'Aesira My Challenge (Giant Volleyball Challenge)', form: 3, pic_teacher_id: 't-107' },
  { id: 'c-302', name: 'Aesira My Challenge (My Mission Malaysia)', form: 3, pic_teacher_id: 't-107' },
  { id: 'c-303', name: 'Slot RBT', form: 3, pic_teacher_id: 't-112' },
  { id: 'c-304', name: 'Slot Sejarah', form: 3, pic_teacher_id: 't-113' },
  { id: 'c-305', name: 'Slot Malam Citrawarna', form: 3, pic_teacher_id: 't-113' },

  // Tingkatan 4 (Tiada pertandingan rekaan; pengguna tambah melalui Data Master)
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
    pic_teacher_id: 't-101',
    targets: [{ form: 1 }, { form: 2 }]
  },
  {
    id: 's-102',
    title: 'Pementasan Cerpen',
    date: '2026-09-13',
    start_time: '10:30',
    end_time: '12:30',
    pic_teacher_id: 't-111',
    targets: [{ form: 1 }]
  },
  {
    id: 's-103',
    title: 'Newspaper Scavenger Hunt',
    date: '2026-09-13',
    start_time: '14:30',
    end_time: '16:30',
    pic_teacher_id: 't-111',
    targets: [{ form: 1 }]
  },
  {
    id: 's-104',
    title: 'Slot Malam Citrawarna',
    date: '2026-09-13',
    start_time: '20:30',
    end_time: '23:00',
    pic_teacher_id: 't-113',
    targets: [{ form: 1 }, { form: 2 }, { form: 3 }, { form: 4 }]
  },

  // 14 September 2026
  {
    id: 's-201',
    title: 'Aesira My Challenge (Giant Volleyball Challenge)',
    date: '2026-09-14',
    start_time: '08:00',
    end_time: '12:00',
    pic_teacher_id: 't-107',
    targets: [{ form: 3 }]
  },
  {
    id: 's-202',
    title: 'Misi Menakluk al Gebra',
    date: '2026-09-14',
    start_time: '14:00',
    end_time: '16:30',
    pic_teacher_id: 't-112',
    targets: [{ form: 1 }]
  },
  {
    id: 's-203',
    title: 'Slot RBT & Pertandingan Inovasi',
    date: '2026-09-14',
    start_time: '14:30',
    end_time: '17:00',
    pic_teacher_id: 't-112',
    targets: [{ form: 3 }]
  },

  // 15 September 2026
  {
    id: 's-301',
    title: 'Aesira My Challenge (My Mission Malaysia)',
    date: '2026-09-15',
    start_time: '08:00',
    end_time: '11:30',
    pic_teacher_id: 't-107',
    targets: [{ form: 3 }]
  },
  {
    id: 's-302',
    title: 'Majlis Penutupan & Pengumuman Juara Keseluruhan',
    date: '2026-09-15',
    start_time: '14:30',
    end_time: '17:00',
    pic_teacher_id: 't-101',
    targets: [{ form: 1 }, { form: 2 }, { form: 3 }, { form: 4 }, { form: 5 }]
  }
];
