// ============================================================
// Database & Domain Types for PORTAL MINGGU AKTIVITI MRSM TUMPAT 2026
// ============================================================

export type FormLevel = 1 | 2 | 3 | 4 | 5;
export type CompetitionFormLevel = 1 | 2 | 3 | 4; // T5 tiada pertandingan

export interface Teacher {
  id: string;
  salary_no: string;
  name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Homeroom {
  id: string;
  form: FormLevel;
  name: string;
  advisor_teacher_id?: string | null;
  needs_review?: boolean;
  created_at?: string;
  updated_at?: string;
  advisor?: Teacher | null;
}

export interface Competition {
  id: string;
  name: string;
  form: CompetitionFormLevel;
  pic_teacher_id?: string | null;
  created_at?: string;
  updated_at?: string;
  pic?: Teacher | null;
}

export interface MeritSetting {
  id: string;
  placement: string; // Johan, Naib Johan, Ketiga, Keempat, Kelima, Penyertaan
  points: number;
  updated_at?: string;
}

export interface ScheduleSlotTarget {
  id?: string;
  schedule_slot_id?: string;
  form: FormLevel;
}

export interface ScheduleSlot {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string; // HH:MM or HH:MM:SS
  pic_teacher_id: string;
  created_at?: string;
  updated_at?: string;
  pic?: Teacher | null;
  targets?: ScheduleSlotTarget[];
}

export interface ResultEntry {
  id?: string;
  result_id?: string;
  homeroom_id: string;
  placement: number | null; // 1 to 5, or null for participation
  merit: number; // 100, 70, 40, 30, 20, 10
  homeroom?: Homeroom;
}

export interface Result {
  id: string;
  competition_id: string;
  entered_by_teacher_id?: string | null;
  created_at?: string;
  updated_at?: string;
  competition?: Competition;
  entered_by?: Teacher | null;
  entries?: ResultEntry[];
}

export interface ReportImage {
  id: string;
  report_id: string;
  storage_path: string;
  caption?: string | null;
  position: number;
  file_size: number;
  original_file_size?: number | null;
  width?: number | null;
  height?: number | null;
  mime_type: string;
  created_at?: string;
  public_url?: string;
}

export interface Report {
  id: string;
  schedule_slot_id: string;
  uploaded_by_teacher_id?: string | null;
  summary: string;
  created_at?: string;
  updated_at?: string;
  schedule_slot?: ScheduleSlot;
  uploaded_by?: Teacher | null;
  images?: ReportImage[];
}

export interface TeacherSession {
  id: string;
  name: string;
  salary_no: string;
  role: string;
}

export interface HomeroomRanking {
  rank: number;
  homeroom_id: string;
  homeroom_name: string;
  form: FormLevel;
  advisor_name: string;
  total_merit: number;
  breakdown: {
    competition_name: string;
    placement: number | null;
    merit: number;
  }[];
}

export interface MasterDataImportSummary {
  created: number;
  updated: number;
  skipped: number;
  needsReview: number;
  records: {
    form: number;
    homeroom_name: string;
    teacher_name: string;
    salary_no: string;
    status: 'created' | 'updated' | 'skipped' | 'needs_review';
    notes?: string;
  }[];
}

export interface PostComment {
  id: string;
  post_id: string;
  author_name: string;
  author_role: string; // 'Guru' | 'Pelajar' | 'Warga MRSM' | etc.
  teacher_id?: string | null;
  content: string;
  created_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  client_id: string;
  created_at?: string;
}

export interface CommunityPost {
  id: string;
  image_url: string;
  storage_path?: string;
  caption?: string | null;
  author_name: string;
  author_role: string; // 'Guru' | 'Pelajar' | 'Warga MRSM'
  teacher_id?: string | null;
  teacher?: Teacher | null;
  likes_count: number;
  has_liked?: boolean;
  comments_count: number;
  comments?: PostComment[];
  created_at: string;
  updated_at?: string;
}

export interface CreatePostInput {
  image_url: string;
  storage_path?: string;
  caption: string;
  author_name: string;
  author_role: string;
  teacher_id?: string | null;
}

export interface CreateCommentInput {
  post_id: string;
  author_name: string;
  author_role: string;
  teacher_id?: string | null;
  content: string;
}
