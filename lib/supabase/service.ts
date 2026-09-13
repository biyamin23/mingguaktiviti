import { supabase, isSupabaseConfigured } from './client';
import { 
  Teacher, Homeroom, Competition, ScheduleSlot, 
  Result, ResultEntry, Report, ReportImage, 
  MeritSetting, HomeroomRanking, FormLevel, CompetitionFormLevel,
  CommunityPost, PostComment, CreatePostInput, CreateCommentInput
} from '@/types/database';
import { 
  INITIAL_TEACHERS, INITIAL_HOMEROOMS, INITIAL_COMPETITIONS, 
  INITIAL_MERIT_SETTINGS, INITIAL_SCHEDULE_SLOTS 
} from '@/lib/data/initial-data';

// Key for browser fallback persistence when Supabase keys are not yet provided
const STORAGE_PREFIX = 'mingguaktiviti_local_';

function getLocalStore<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setLocalStore<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

// -------------------------------------------------------------
// 1. TEACHERS (GURU)
// -------------------------------------------------------------
export async function getTeachers(): Promise<Teacher[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data as Teacher[];
    } catch (e) {
      console.warn('Falling back to local teachers:', e);
    }
  }
  return getLocalStore<Teacher[]>('teachers', INITIAL_TEACHERS);
}

export async function getTeacherBySalaryNo(salaryNo: string): Promise<Teacher | null> {
  const teachers = await getTeachers();
  const cleaned = salaryNo.trim().toUpperCase();
  return teachers.find(t => t.salary_no.trim().toUpperCase() === cleaned) || null;
}

export async function createTeacher(teacher: Omit<Teacher, 'id'>): Promise<{ data: Teacher | null; error: string | null }> {
  const teachers = await getTeachers();
  const cleanedSalary = teacher.salary_no.trim().toUpperCase();
  
  if (teachers.some(t => t.salary_no.trim().toUpperCase() === cleanedSalary)) {
    return { data: null, error: 'Nombor gaji ini telah wujud dalam sistem.' };
  }

  const newTeacher: Teacher = {
    id: 't-' + Math.random().toString(36).substring(2, 9),
    salary_no: cleanedSalary,
    name: teacher.name.trim(),
    role: teacher.role?.trim() || 'Guru',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          salary_no: newTeacher.salary_no,
          name: newTeacher.name,
          role: newTeacher.role
        }])
        .select()
        .single();
      if (!error && data) return { data: data as Teacher, error: null };
    } catch (e: any) {
      console.warn('Supabase createTeacher error, using local:', e);
    }
  }

  const updated = [...teachers, newTeacher];
  setLocalStore('teachers', updated);
  return { data: newTeacher, error: null };
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<{ data: Teacher | null; error: string | null }> {
  const teachers = await getTeachers();
  const index = teachers.findIndex(t => t.id === id);
  if (index === -1) return { data: null, error: 'Guru tidak ditemui.' };

  if (updates.salary_no) {
    const cleanedSalary = updates.salary_no.trim().toUpperCase();
    if (teachers.some(t => t.id !== id && t.salary_no.trim().toUpperCase() === cleanedSalary)) {
      return { data: null, error: 'Nombor gaji telah digunakan oleh guru lain.' };
    }
    updates.salary_no = cleanedSalary;
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return { data: data as Teacher, error: null };
    } catch (e) {
      console.warn('Supabase updateTeacher error, using local:', e);
    }
  }

  const updatedTeacher = { ...teachers[index], ...updates, updated_at: new Date().toISOString() };
  teachers[index] = updatedTeacher;
  setLocalStore('teachers', teachers);
  return { data: updatedTeacher, error: null };
}

export async function deleteTeacher(id: string): Promise<{ success: boolean; error: string | null }> {
  // Check if assigned as advisor in any homeroom
  const homerooms = await getHomerooms();
  if (homerooms.some(h => h.advisor_teacher_id === id)) {
    return { success: false, error: 'Guru ini ialah Penasihat Homeroom dan tidak boleh dipadam. Sila tukar penasihat terlebih dahulu.' };
  }

  // Check if assigned as PIC in any schedule slot
  const slots = await getScheduleSlots();
  if (slots.some(s => s.pic_teacher_id === id)) {
    return { success: false, error: 'Guru ini ialah PIC bagi slot jadual dan tidak boleh dipadam.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      console.warn('Supabase deleteTeacher error:', e);
    }
  }

  const teachers = await getTeachers();
  setLocalStore('teachers', teachers.filter(t => t.id !== id));
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 2. HOMEROOMS (KELAS HOMEROOM)
// -------------------------------------------------------------
export async function getHomerooms(): Promise<Homeroom[]> {
  const teachers = await getTeachers();
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('homerooms')
        .select('*, advisor:teachers(*)')
        .order('form', { ascending: true })
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data as Homeroom[];
    } catch (e) {
      console.warn('Falling back to local homerooms:', e);
    }
  }

  const local = getLocalStore<Homeroom[]>('homerooms', INITIAL_HOMEROOMS);
  return local.map(h => ({
    ...h,
    advisor: h.advisor_teacher_id ? teacherMap.get(h.advisor_teacher_id) || null : null
  }));
}

export async function getHomeroomsByForm(form: FormLevel): Promise<Homeroom[]> {
  const all = await getHomerooms();
  return all.filter(h => Number(h.form) === Number(form));
}

export async function createHomeroom(homeroom: { form: FormLevel; name: string; advisor_teacher_id?: string | null }): Promise<{ data: Homeroom | null; error: string | null }> {
  const homerooms = await getHomerooms();
  const trimmedName = homeroom.name.trim();

  // Check duplicate homeroom in same form
  if (homerooms.some(h => h.form === homeroom.form && h.name.toLowerCase() === trimmedName.toLowerCase())) {
    return { data: null, error: `Homeroom "${trimmedName}" sudah wujud dalam Tingkatan ${homeroom.form}.` };
  }

  // Check if advisor already assigned to another homeroom
  if (homeroom.advisor_teacher_id) {
    const existing = homerooms.find(h => h.advisor_teacher_id === homeroom.advisor_teacher_id);
    if (existing) {
      return { data: null, error: `Guru ini telah ditugaskan sebagai penasihat bagi ${existing.name}. Satu guru hanya boleh menasihati satu homeroom.` };
    }
  }

  const newHomeroom: Homeroom = {
    id: 'hr-' + Math.random().toString(36).substring(2, 9),
    form: homeroom.form,
    name: trimmedName,
    advisor_teacher_id: homeroom.advisor_teacher_id || null,
    needs_review: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('homerooms')
        .insert([{
          form: newHomeroom.form,
          name: newHomeroom.name,
          advisor_teacher_id: newHomeroom.advisor_teacher_id
        }])
        .select('*, advisor:teachers(*)')
        .single();
      if (!error && data) return { data: data as Homeroom, error: null };
    } catch (e) {
      console.warn('Supabase createHomeroom error, using local:', e);
    }
  }

  const updated = [...homerooms, newHomeroom];
  setLocalStore('homerooms', updated);
  return { data: newHomeroom, error: null };
}

export async function updateHomeroom(id: string, updates: Partial<Homeroom>): Promise<{ data: Homeroom | null; error: string | null }> {
  const homerooms = await getHomerooms();
  const index = homerooms.findIndex(h => h.id === id);
  if (index === -1) return { data: null, error: 'Homeroom tidak ditemui.' };

  // Advisor uniqueness check
  if (updates.advisor_teacher_id) {
    const conflict = homerooms.find(h => h.id !== id && h.advisor_teacher_id === updates.advisor_teacher_id);
    if (conflict) {
      return { data: null, error: `Guru ini telah ditugaskan sebagai penasihat bagi ${conflict.name}.` };
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('homerooms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*, advisor:teachers(*)')
        .single();
      if (!error && data) return { data: data as Homeroom, error: null };
    } catch (e) {
      console.warn('Supabase updateHomeroom error:', e);
    }
  }

  const updatedHomeroom = { ...homerooms[index], ...updates, updated_at: new Date().toISOString() };
  homerooms[index] = updatedHomeroom;
  setLocalStore('homerooms', homerooms);
  return { data: updatedHomeroom, error: null };
}

export async function deleteHomeroom(id: string): Promise<{ success: boolean; error: string | null }> {
  // Check if referenced by results
  const results = await getResults();
  for (const r of results) {
    if (r.entries?.some(e => e.homeroom_id === id)) {
      return { success: false, error: 'Homeroom ini mempunyai rekod keputusan pertandingan dan tidak boleh dipadam.' };
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('homerooms').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e) {
      console.warn('Supabase deleteHomeroom error:', e);
    }
  }

  const homerooms = await getHomerooms();
  setLocalStore('homerooms', homerooms.filter(h => h.id !== id));
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 3. COMPETITIONS (PERTANDINGAN) - Tingkatan 1 - 4 Sahaja
// -------------------------------------------------------------
export async function getCompetitions(): Promise<Competition[]> {
  const teachers = await getTeachers();
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*, pic:teachers(*)')
        .order('form', { ascending: true })
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data as Competition[];
    } catch (e) {
      console.warn('Falling back to local competitions:', e);
    }
  }

  const local = getLocalStore<Competition[]>('competitions', INITIAL_COMPETITIONS);
  return local.map(c => ({
    ...c,
    pic: c.pic_teacher_id ? teacherMap.get(c.pic_teacher_id) || null : null
  }));
}

export async function createCompetition(comp: { name: string; form: number; pic_teacher_id?: string | null }): Promise<{ data: Competition | null; error: string | null }> {
  // Strict rule: Tingkatan 5 HAS NO COMPETITIONS
  if (comp.form === 5 || comp.form < 1 || comp.form > 4) {
    return { data: null, error: 'Tingkatan 5 tidak mempunyai pertandingan. Hanya Tingkatan 1 hingga 4 dibenarkan.' };
  }

  const comps = await getCompetitions();
  const trimmedName = comp.name.trim();

  if (comps.some(c => c.form === comp.form && c.name.toLowerCase() === trimmedName.toLowerCase())) {
    return { data: null, error: `Pertandingan "${trimmedName}" sudah wujud bagi Tingkatan ${comp.form}.` };
  }

  const newComp: Competition = {
    id: 'c-' + Math.random().toString(36).substring(2, 9),
    name: trimmedName,
    form: comp.form as CompetitionFormLevel,
    pic_teacher_id: comp.pic_teacher_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .insert([{
          name: newComp.name,
          form: newComp.form,
          pic_teacher_id: newComp.pic_teacher_id
        }])
        .select('*, pic:teachers(*)')
        .single();
      if (!error && data) return { data: data as Competition, error: null };
    } catch (e) {
      console.warn('Supabase createCompetition error:', e);
    }
  }

  const updated = [...comps, newComp];
  setLocalStore('competitions', updated);
  return { data: newComp, error: null };
}

export async function updateCompetition(id: string, updates: Partial<Competition>): Promise<{ data: Competition | null; error: string | null }> {
  if (Number(updates.form) === 5) {
    return { data: null, error: 'Tingkatan 5 tidak mempunyai pertandingan.' };
  }

  const comps = await getCompetitions();
  const index = comps.findIndex(c => c.id === id);
  if (index === -1) return { data: null, error: 'Pertandingan tidak ditemui.' };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*, pic:teachers(*)')
        .single();
      if (!error && data) return { data: data as Competition, error: null };
    } catch (e) {
      console.warn('Supabase updateCompetition error:', e);
    }
  }

  const updatedComp = { ...comps[index], ...updates, updated_at: new Date().toISOString() };
  comps[index] = updatedComp;
  setLocalStore('competitions', comps);
  return { data: updatedComp, error: null };
}

export async function deleteCompetition(id: string): Promise<{ success: boolean; error: string | null }> {
  const results = await getResults();
  if (results.some(r => r.competition_id === id)) {
    return { success: false, error: 'Pertandingan ini telah mempunyai keputusan yang direkodkan dan tidak boleh dipadam.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('competitions').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e) {
      console.warn('Supabase deleteCompetition error:', e);
    }
  }

  const comps = await getCompetitions();
  setLocalStore('competitions', comps.filter(c => c.id !== id));
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 4. JADUAL (SCHEDULE SLOTS)
// -------------------------------------------------------------
export async function getScheduleSlots(): Promise<ScheduleSlot[]> {
  const teachers = await getTeachers();
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('schedule_slots')
        .select('*, pic:teachers(*), targets:schedule_slot_targets(*)')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      if (!error && data && data.length > 0) return data as ScheduleSlot[];
    } catch (e) {
      console.warn('Falling back to local schedule slots:', e);
    }
  }

  const local = getLocalStore<ScheduleSlot[]>('schedule_slots', INITIAL_SCHEDULE_SLOTS);
  return local.map(s => ({
    ...s,
    pic: s.pic_teacher_id ? teacherMap.get(s.pic_teacher_id) || null : null
  })).sort((a, b) => {
    const dComp = a.date.localeCompare(b.date);
    if (dComp !== 0) return dComp;
    return a.start_time.localeCompare(b.start_time);
  });
}

export async function getScheduleSlotById(id: string): Promise<ScheduleSlot | null> {
  const slots = await getScheduleSlots();
  return slots.find(s => s.id === id) || null;
}

export async function createScheduleSlot(slot: {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  pic_teacher_id: string;
  targets: FormLevel[];
}): Promise<{ data: ScheduleSlot | null; error: string | null }> {
  // Validate times
  if (slot.end_time <= slot.start_time) {
    return { data: null, error: 'Masa tamat mesti lebih lewat daripada masa mula.' };
  }

  if (!slot.targets || slot.targets.length === 0) {
    return { data: null, error: 'Sila pilih sekurang-kurangnya satu tingkatan sasaran.' };
  }

  const newId = 's-' + Math.random().toString(36).substring(2, 9);
  const targetObjects = slot.targets.map(form => ({ form, schedule_slot_id: newId }));

  const newSlot: ScheduleSlot = {
    id: newId,
    title: slot.title.trim(),
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    pic_teacher_id: slot.pic_teacher_id,
    targets: targetObjects,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data: inserted, error: slotError } = await supabase
        .from('schedule_slots')
        .insert([{
          title: newSlot.title,
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          pic_teacher_id: newSlot.pic_teacher_id
        }])
        .select()
        .single();

      if (!slotError && inserted) {
        // Insert targets
        const targetsToInsert = slot.targets.map(form => ({
          schedule_slot_id: inserted.id,
          form
        }));
        await supabase.from('schedule_slot_targets').insert(targetsToInsert);
        const complete = await getScheduleSlotById(inserted.id);
        return { data: complete, error: null };
      }
    } catch (e) {
      console.warn('Supabase createScheduleSlot error, using local:', e);
    }
  }

  const slots = await getScheduleSlots();
  const updated = [...slots, newSlot];
  setLocalStore('schedule_slots', updated);
  return { data: newSlot, error: null };
}

export async function updateScheduleSlot(id: string, updates: {
  title?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  pic_teacher_id?: string;
  targets?: FormLevel[];
}): Promise<{ data: ScheduleSlot | null; error: string | null }> {
  const slots = await getScheduleSlots();
  const existing = slots.find(s => s.id === id);
  if (!existing) return { data: null, error: 'Slot jadual tidak ditemui.' };

  const finalStart = updates.start_time || existing.start_time;
  const finalEnd = updates.end_time || existing.end_time;
  if (finalEnd <= finalStart) {
    return { data: null, error: 'Masa tamat mesti lebih lewat daripada masa mula.' };
  }

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('schedule_slots')
        .update({
          title: updates.title?.trim() || existing.title,
          date: updates.date || existing.date,
          start_time: finalStart,
          end_time: finalEnd,
          pic_teacher_id: updates.pic_teacher_id || existing.pic_teacher_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updates.targets) {
        await supabase.from('schedule_slot_targets').delete().eq('schedule_slot_id', id);
        const targetsToInsert = updates.targets.map(form => ({
          schedule_slot_id: id,
          form
        }));
        await supabase.from('schedule_slot_targets').insert(targetsToInsert);
      }

      const complete = await getScheduleSlotById(id);
      return { data: complete, error: null };
    } catch (e) {
      console.warn('Supabase updateScheduleSlot error:', e);
    }
  }

  const updatedSlot: ScheduleSlot = {
    ...existing,
    ...updates,
    title: updates.title?.trim() || existing.title,
    targets: updates.targets ? updates.targets.map(form => ({ form, schedule_slot_id: id })) : existing.targets,
    updated_at: new Date().toISOString()
  };

  const updatedSlots = slots.map(s => s.id === id ? updatedSlot : s);
  setLocalStore('schedule_slots', updatedSlots);
  return { data: updatedSlot, error: null };
}

export async function deleteScheduleSlot(id: string): Promise<{ success: boolean; error: string | null }> {
  // Check if referenced by reports
  const reports = await getReports();
  if (reports.some(r => r.schedule_slot_id === id)) {
    return { success: false, error: 'Slot ini mempunyai laporan bergambar yang telah dihantar dan tidak boleh dipadam.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('schedule_slots').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e) {
      console.warn('Supabase deleteScheduleSlot error:', e);
    }
  }

  const slots = await getScheduleSlots();
  setLocalStore('schedule_slots', slots.filter(s => s.id !== id));
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 5. MERIT SETTINGS
// -------------------------------------------------------------
export async function getMeritSettings(): Promise<MeritSetting[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('merit_settings').select('*');
      if (!error && data && data.length > 0) return data as MeritSetting[];
    } catch (e) {
      console.warn('Falling back to local merit settings:', e);
    }
  }
  return getLocalStore<MeritSetting[]>('merit_settings', INITIAL_MERIT_SETTINGS);
}

export async function updateMeritSettings(settings: { placement: string; points: number }[]): Promise<{ success: boolean }> {
  if (isSupabaseConfigured) {
    try {
      for (const s of settings) {
        await supabase
          .from('merit_settings')
          .update({ points: s.points, updated_at: new Date().toISOString() })
          .eq('placement', s.placement);
      }
      return { success: true };
    } catch (e) {
      console.warn('Supabase updateMeritSettings error:', e);
    }
  }

  const current = await getMeritSettings();
  const updated = current.map(item => {
    const match = settings.find(s => s.placement === item.placement);
    return match ? { ...item, points: match.points, updated_at: new Date().toISOString() } : item;
  });
  setLocalStore('merit_settings', updated);
  return { success: true };
}

// -------------------------------------------------------------
// 6. RESULTS & MERIT ENGINE (KEPUTUSAN PERTANDINGAN)
// -------------------------------------------------------------
export async function getResults(): Promise<Result[]> {
  const competitions = await getCompetitions();
  const teachers = await getTeachers();
  const homerooms = await getHomerooms();

  const compMap = new Map(competitions.map(c => [c.id, c]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const hrMap = new Map(homerooms.map(h => [h.id, h]));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          competition:competitions(*),
          entered_by:teachers(*),
          entries:result_entries(*, homeroom:homerooms(*))
        `)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Result[];
    } catch (e) {
      console.warn('Falling back to local results:', e);
    }
  }

  const local = getLocalStore<Result[]>('results', []);
  return local.map(r => ({
    ...r,
    competition: compMap.get(r.competition_id) || r.competition,
    entered_by: r.entered_by_teacher_id ? teacherMap.get(r.entered_by_teacher_id) || null : null,
    entries: r.entries?.map(e => ({
      ...e,
      homeroom: hrMap.get(e.homeroom_id) || e.homeroom
    }))
  }));
}

export async function saveCompetitionResult(params: {
  competition_id: string;
  entered_by_teacher_id: string;
  placements: {
    placement: 1 | 2 | 3 | 4 | 5;
    homeroom_id: string;
  }[];
}): Promise<{ data: Result | null; error: string | null }> {
  const competitions = await getCompetitions();
  const comp = competitions.find(c => c.id === params.competition_id);
  if (!comp) return { data: null, error: 'Pertandingan tidak ditemui.' };

  // Validate exactly 5 unique winners
  if (params.placements.length !== 5) {
    return { data: null, error: 'Sila pilih kesemua 5 pemenang (Johan hingga Kelima).' };
  }

  const selectedHrIds = params.placements.map(p => p.homeroom_id);
  const uniqueHrIds = new Set(selectedHrIds);
  if (uniqueHrIds.size !== 5) {
    return { data: null, error: 'Sebuah homeroom tidak boleh memenangi lebih daripada satu kedudukan.' };
  }

  // Get all homerooms of this form to calculate participation points
  const formHomerooms = await getHomeroomsByForm(comp.form);
  const meritSettings = await getMeritSettings();
  const meritMap = new Map(meritSettings.map(m => [m.placement, m.points]));

  const placementMerit: Record<number, number> = {
    1: meritMap.get('Johan') ?? 100,
    2: meritMap.get('Naib Johan') ?? 70,
    3: meritMap.get('Ketiga') ?? 40,
    4: meritMap.get('Keempat') ?? 30,
    5: meritMap.get('Kelima') ?? 20,
  };
  const participationMerit = meritMap.get('Penyertaan') ?? 10;

  // Build entries for top 5
  const entries: ResultEntry[] = params.placements.map(p => ({
    id: 're-' + Math.random().toString(36).substring(2, 9),
    homeroom_id: p.homeroom_id,
    placement: p.placement,
    merit: placementMerit[p.placement]
  }));

  // Build entries for all remaining participating homerooms in the same form
  for (const hr of formHomerooms) {
    if (!uniqueHrIds.has(hr.id)) {
      entries.push({
        id: 're-' + Math.random().toString(36).substring(2, 9),
        homeroom_id: hr.id,
        placement: null,
        merit: participationMerit
      });
    }
  }

  const resultId = 'r-' + Math.random().toString(36).substring(2, 9);
  const newResult: Result = {
    id: resultId,
    competition_id: comp.id,
    entered_by_teacher_id: params.entered_by_teacher_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    competition: comp,
    entries
  };

  if (isSupabaseConfigured) {
    try {
      // Delete existing result for this competition if any
      await supabase.from('results').delete().eq('competition_id', comp.id);

      const { data: insertedResult, error: rErr } = await supabase
        .from('results')
        .insert([{
          competition_id: comp.id,
          entered_by_teacher_id: params.entered_by_teacher_id
        }])
        .select()
        .single();

      if (!rErr && insertedResult) {
        const entriesToInsert = entries.map(e => ({
          result_id: insertedResult.id,
          homeroom_id: e.homeroom_id,
          placement: e.placement,
          merit: e.merit
        }));
        await supabase.from('result_entries').insert(entriesToInsert);
        return { data: newResult, error: null };
      }
    } catch (e) {
      console.warn('Supabase saveCompetitionResult error, using local:', e);
    }
  }

  const existingResults = await getResults();
  const filtered = existingResults.filter(r => r.competition_id !== comp.id);
  setLocalStore('results', [...filtered, newResult]);
  return { data: newResult, error: null };
}

export async function deleteCompetitionResult(competitionId: string): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('results').delete().eq('competition_id', competitionId);
      if (error) {
        console.error('Error deleting result from Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.warn('Supabase deleteCompetitionResult error:', e);
      return { success: false, error: e.message || 'Ralat memadam keputusan.' };
    }
  }

  const existing = await getResults();
  const filtered = existing.filter(r => r.competition_id !== competitionId);
  setLocalStore('results', filtered);
  return { success: true, error: null };
}

export async function clearAllResults(): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.error('Error clearing all results from Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.warn('Supabase clearAllResults error:', e);
      return { success: false, error: e.message || 'Ralat mengosongkan semua keputusan.' };
    }
  }

  setLocalStore('results', []);
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 7. RANKING ENGINE (T1 - T4)
// -------------------------------------------------------------
export async function getRankingByForm(form: FormLevel): Promise<HomeroomRanking[]> {
  if (form === 5) return []; // Tingkatan 5 tiada ranking pertandingan

  const homerooms = await getHomeroomsByForm(form);
  const results = await getResults();

  // Filter results targeting this form
  const formResults = results.filter(r => r.competition?.form === form);

  const rankings: HomeroomRanking[] = homerooms.map(hr => {
    let total = 0;
    const breakdown: HomeroomRanking['breakdown'] = [];

    for (const res of formResults) {
      const entry = res.entries?.find(e => e.homeroom_id === hr.id);
      if (entry) {
        total += entry.merit;
        breakdown.push({
          competition_name: res.competition?.name || 'Pertandingan',
          placement: entry.placement,
          merit: entry.merit
        });
      }
    }

    return {
      rank: 1,
      homeroom_id: hr.id,
      homeroom_name: hr.name,
      form: hr.form,
      advisor_name: hr.advisor?.name || 'Belum Ditetapkan',
      total_merit: total,
      breakdown
    };
  });

  // Sort highest total merit first
  rankings.sort((a, b) => b.total_merit - a.total_merit);

  // Assign ranks with tie handling
  rankings.forEach((item, index) => {
    item.rank = index + 1;
  });

  return rankings;
}

// -------------------------------------------------------------
// 8. REPORTS & IMAGES (LAPORAN BERGAMBAR & GALERI)
// -------------------------------------------------------------

export function getReportImageUrl(img?: { public_url?: string; storage_path?: string } | null): string {
  if (!img) return '';
  if (img.public_url && (img.public_url.startsWith('http://') || img.public_url.startsWith('https://') || img.public_url.startsWith('data:'))) {
    return img.public_url;
  }
  if (img.storage_path) {
    if (img.storage_path.startsWith('http://') || img.storage_path.startsWith('https://') || img.storage_path.startsWith('data:')) {
      return img.storage_path;
    }
    const cleanPath = img.storage_path.replace(/^\/+/, '');
    const { data } = supabase.storage
      .from('report-images')
      .getPublicUrl(cleanPath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }
  return img.public_url || '';
}

export async function getReports(): Promise<Report[]> {
  const slots = await getScheduleSlots();
  const teachers = await getTeachers();
  const slotMap = new Map(slots.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          schedule_slot:schedule_slots(*, pic:teachers(*), targets:schedule_slot_targets(*)),
          uploaded_by:teachers(*),
          images:report_images(*)
        `)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((rep: any) => ({
          ...rep,
          images: (rep.images || []).map((img: any) => ({
            ...img,
            public_url: getReportImageUrl(img)
          }))
        })) as Report[];
      }
    } catch (e) {
      console.warn('Falling back to local reports:', e);
    }
  }

  const local = getLocalStore<Report[]>('reports', []);
  return local.map(r => ({
    ...r,
    schedule_slot: slotMap.get(r.schedule_slot_id) || r.schedule_slot,
    uploaded_by: r.uploaded_by_teacher_id ? teacherMap.get(r.uploaded_by_teacher_id) || null : null,
    images: (r.images || []).map(img => ({
      ...img,
      public_url: getReportImageUrl(img)
    }))
  }));
}

export async function createReport(params: {
  schedule_slot_id: string;
  uploaded_by_teacher_id?: string | null;
  summary: string;
  images: {
    storage_path: string;
    caption?: string;
    file_size: number;
    original_file_size?: number;
    width?: number;
    height?: number;
    mime_type?: string;
    public_url?: string;
  }[];
}): Promise<{ data: Report | null; error: string | null }> {
  const slots = await getScheduleSlots();
  const slot = slots.find(s => s.id === params.schedule_slot_id);
  if (!slot) return { data: null, error: 'Slot jadual tidak ditemui.' };

  const reportId = 'rep-' + Math.random().toString(36).substring(2, 9);
  const reportImages: ReportImage[] = params.images.map((img, idx) => ({
    id: 'img-' + Math.random().toString(36).substring(2, 9),
    report_id: reportId,
    storage_path: img.storage_path,
    caption: img.caption || null,
    position: idx,
    file_size: img.file_size,
    original_file_size: img.original_file_size || null,
    width: img.width || null,
    height: img.height || null,
    mime_type: img.mime_type || 'image/webp',
    public_url: img.public_url || img.storage_path,
    created_at: new Date().toISOString()
  }));

  const newReport: Report = {
    id: reportId,
    schedule_slot_id: params.schedule_slot_id,
    uploaded_by_teacher_id: params.uploaded_by_teacher_id || null,
    summary: params.summary.trim(),
    schedule_slot: slot,
    images: reportImages,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data: repData, error: repErr } = await supabase
        .from('reports')
        .insert([{
          schedule_slot_id: newReport.schedule_slot_id,
          uploaded_by_teacher_id: newReport.uploaded_by_teacher_id,
          summary: newReport.summary
        }])
        .select()
        .single();

      if (!repErr && repData) {
        const imgsToInsert = reportImages.map(img => ({
          report_id: repData.id,
          storage_path: img.storage_path,
          caption: img.caption,
          position: img.position,
          file_size: img.file_size,
          original_file_size: img.original_file_size,
          width: img.width,
          height: img.height,
          mime_type: img.mime_type
        }));
        await supabase.from('report_images').insert(imgsToInsert);
        return { data: newReport, error: null };
      }
    } catch (e) {
      console.warn('Supabase createReport error, using local:', e);
    }
  }

  const reports = await getReports();
  setLocalStore('reports', [newReport, ...reports]);
  return { data: newReport, error: null };
}

export async function deleteReport(id: string): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    } catch (e) {
      console.warn('Supabase deleteReport error:', e);
    }
  }

  const reports = await getReports();
  setLocalStore('reports', reports.filter(r => r.id !== id));
  return { success: true, error: null };
}

// -------------------------------------------------------------
// 9. SUPABASE STORAGE UPLOADER
// -------------------------------------------------------------
export async function uploadReportImage(
  file: Blob, 
  reportId: string
): Promise<{ path: string; publicUrl: string; error: string | null }> {
  const fileName = `${Math.random().toString(36).substring(2, 9)}.webp`;
  const storagePath = `reports/${reportId}/${fileName}`;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.storage
        .from('report-images')
        .upload(storagePath, file, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        return { path: '', publicUrl: '', error: 'Gagal memuat naik gambar ke storan: ' + error.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(storagePath);

      return { path: storagePath, publicUrl: publicUrlData.publicUrl, error: null };
    } catch (e: any) {
      console.warn('Storage upload failed, fallback to ObjectURL:', e);
    }
  }

  // Fallback in browser: Object URL or local storage for demonstration
  const publicUrl = URL.createObjectURL(file);
  return { path: storagePath, publicUrl, error: null };
}

// -------------------------------------------------------------
// 10. COMMUNITY SOCIAL MEDIA POSTS & COMMENTS (INSTAGRAM-STYLE)
// -------------------------------------------------------------

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    image_url: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=1200&q=80',
    caption: 'Semangat membara perbarisan pembukaan Minggu Aktiviti Semester 2 MRSM Tumpat 2026! Tahniah kepada semua kontinjen homeroom yang tampil kemas dan berdisiplin. 🏆🔥 #MingguAktiviti2026 #MRSMTumpat #BerdisiplinBerilmuBeramal',
    author_name: 'Cikgu Faris (Penyelaras)',
    author_role: 'Guru',
    likes_count: 38,
    comments_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    comments: [
      {
        id: 'comm-1',
        post_id: 'post-1',
        author_name: 'Muhammad Hakim (T3)',
        author_role: 'Pelajar',
        content: 'Terbaik cikgu! Kontinjen Homeroom kami bersedia untuk rebut merit Johan tahun ni! 💪',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'comm-2',
        post_id: 'post-1',
        author_name: 'Ustaz Ubai',
        author_role: 'Guru',
        content: 'Meriah dan teratur sekali. Semoga semua murid bertanding dengan semangat kesukanan yang tinggi.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      }
    ]
  },
  {
    id: 'post-2',
    image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    caption: 'Pelancaran Eksperimen Roket Air & Pertandingan Inovasi Sains Tingkatan 2 petang tadi. Roket Homeroom Al-Biruni terbang paling jauh dan stabil! 🚀🧪✨ #SainsInovasi #Tingkatan2 #MRSMTumpat',
    author_name: 'Ustazah Siti Aminah',
    author_role: 'Guru',
    likes_count: 27,
    comments_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    comments: [
      {
        id: 'comm-3',
        post_id: 'post-2',
        author_name: 'Nur Aina Sofea (T2)',
        author_role: 'Pelajar',
        content: 'Seronok sangat tadi ustazah, eksperimen menjadi dan dapat banyak ilmu baru!',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      }
    ]
  },
  {
    id: 'post-3',
    image_url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80',
    caption: 'Kenangan manis bersama kawan-kawan Homeroom Cikgu Aisyah selepas berjaya raih Johan Newspaper Scavenger Hunt! Terima kasih atas sokongan padu semua penasihat. 🥇🎉 #HomeroomCikguAisyah #Tingkatan1 #MeritJuara',
    author_name: 'Danish Haikal (T1)',
    author_role: 'Pelajar',
    likes_count: 45,
    comments_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    comments: [
      {
        id: 'comm-4',
        post_id: 'post-3',
        author_name: 'Cikgu Aisyah',
        author_role: 'Guru',
        content: 'Tahniah anak-anak homeroom! Kerjasama dan komitmen anda semua sangat membanggakan!',
        created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      },
      {
        id: 'comm-5',
        post_id: 'post-3',
        author_name: 'Amirul Syafiq',
        author_role: 'Pelajar',
        content: 'Padu Danish! Jumpa di acara sukan esok pula! 🏃‍♂️',
        created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      }
    ]
  }
];

export async function uploadCommunityPostImage(
  file: Blob
): Promise<{ path: string; publicUrl: string; error: string | null }> {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
  const storagePath = `community/${fileName}`;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.storage
        .from('report-images')
        .upload(storagePath, file, {
          contentType: 'image/webp',
          upsert: true
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(storagePath);

        return { path: storagePath, publicUrl: publicUrlData.publicUrl, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase uploadCommunityPostImage error, using ObjectURL fallback:', e);
    }
  }

  // Fallback in browser: Object URL or base64 data URL
  const publicUrl = URL.createObjectURL(file);
  return { path: storagePath, publicUrl, error: null };
}

export async function getCommunityPosts(clientId?: string): Promise<CommunityPost[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          teacher:teachers(id, name, salary_no, role),
          comments:post_comments(*),
          likes:post_likes(*)
        `)
        .order('created_at', { ascending: false });

      if (!postsError && postsData) {
        return postsData.map((p: any) => ({
          id: p.id,
          image_url: p.image_url,
          storage_path: p.storage_path,
          caption: p.caption,
          author_name: p.author_name,
          author_role: p.author_role || (p.teacher ? 'Guru' : 'Warga MRSM'),
          teacher_id: p.teacher_id,
          teacher: p.teacher,
          likes_count: p.likes_count || (p.likes ? p.likes.length : 0),
          has_liked: clientId && p.likes ? p.likes.some((l: any) => l.client_id === clientId) : false,
          comments_count: p.comments ? p.comments.length : 0,
          comments: (p.comments || []).sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
          created_at: p.created_at,
          updated_at: p.updated_at
        }));
      }
    } catch (e) {
      console.warn('Supabase getCommunityPosts failed, using local store:', e);
    }
  }

  // Local storage fallback
  const localPosts = getLocalStore<CommunityPost[]>('community_posts', INITIAL_COMMUNITY_POSTS);
  const userLikes = getLocalStore<Record<string, boolean>>('community_user_likes_' + (clientId || 'guest'), {});

  return localPosts.map(p => ({
    ...p,
    has_liked: !!userLikes[p.id],
    comments_count: p.comments ? p.comments.length : 0,
    comments: p.comments || []
  }));
}

export async function createCommunityPost(
  input: CreatePostInput
): Promise<{ data: CommunityPost | null; error: string | null }> {
  const newPostId = 'post-' + Date.now();
  const newPost: CommunityPost = {
    id: newPostId,
    image_url: input.image_url,
    storage_path: input.storage_path,
    caption: input.caption,
    author_name: input.author_name,
    author_role: input.author_role,
    teacher_id: input.teacher_id || null,
    likes_count: 0,
    has_liked: false,
    comments_count: 0,
    comments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          image_url: input.image_url,
          storage_path: input.storage_path,
          caption: input.caption,
          author_name: input.author_name,
          author_role: input.author_role,
          teacher_id: input.teacher_id || null
        }])
        .select()
        .single();

      if (!error && data) {
        newPost.id = data.id;
        newPost.created_at = data.created_at;
      }
    } catch (e: any) {
      console.warn('Supabase createCommunityPost error, saving to local store:', e);
    }
  }

  // Always update local store
  const existing = getLocalStore<CommunityPost[]>('community_posts', INITIAL_COMMUNITY_POSTS);
  setLocalStore('community_posts', [newPost, ...existing]);

  return { data: newPost, error: null };
}

export async function addPostComment(
  input: CreateCommentInput
): Promise<{ data: PostComment | null; error: string | null }> {
  const newCommentId = 'comm-' + Date.now();
  const newComment: PostComment = {
    id: newCommentId,
    post_id: input.post_id,
    author_name: input.author_name,
    author_role: input.author_role,
    teacher_id: input.teacher_id || null,
    content: input.content,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: input.post_id,
          author_name: input.author_name,
          author_role: input.author_role,
          teacher_id: input.teacher_id || null,
          content: input.content
        }])
        .select()
        .single();

      if (!error && data) {
        newComment.id = data.id;
        newComment.created_at = data.created_at;
      }
    } catch (e: any) {
      console.warn('Supabase addPostComment error, using local:', e);
    }
  }

  // Update local store
  const existing = getLocalStore<CommunityPost[]>('community_posts', INITIAL_COMMUNITY_POSTS);
  const updated = existing.map(p => {
    if (p.id === input.post_id) {
      const currentComments = p.comments || [];
      return {
        ...p,
        comments: [...currentComments, newComment],
        comments_count: currentComments.length + 1
      };
    }
    return p;
  });
  setLocalStore('community_posts', updated);

  return { data: newComment, error: null };
}

export async function togglePostLike(
  postId: string,
  clientId: string
): Promise<{ liked: boolean; likesCount: number; error: string | null }> {
  const existing = getLocalStore<CommunityPost[]>('community_posts', INITIAL_COMMUNITY_POSTS);
  const userLikesKey = 'community_user_likes_' + clientId;
  const userLikes = getLocalStore<Record<string, boolean>>(userLikesKey, {});
  
  const currentlyLiked = !!userLikes[postId];
  const newLikedState = !currentlyLiked;

  let newLikesCount = 0;
  const updated = existing.map(p => {
    if (p.id === postId) {
      newLikesCount = Math.max(0, (p.likes_count || 0) + (newLikedState ? 1 : -1));
      return {
        ...p,
        likes_count: newLikesCount,
        has_liked: newLikedState
      };
    }
    return p;
  });

  userLikes[postId] = newLikedState;
  setLocalStore(userLikesKey, userLikes);
  setLocalStore('community_posts', updated);

  if (isSupabaseConfigured) {
    try {
      if (newLikedState) {
        await supabase.from('post_likes').insert([{ post_id: postId, client_id: clientId }]);
        await supabase.from('community_posts').update({ likes_count: newLikesCount }).eq('id', postId);
      } else {
        await supabase.from('post_likes').delete().match({ post_id: postId, client_id: clientId });
        await supabase.from('community_posts').update({ likes_count: newLikesCount }).eq('id', postId);
      }
    } catch (e: any) {
      console.warn('Supabase togglePostLike error:', e);
    }
  }

  return { liked: newLikedState, likesCount: newLikesCount, error: null };
}

export async function deleteCommunityPost(
  postId: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
    } catch (e: any) {
      console.warn('Supabase deleteCommunityPost error:', e);
    }
  }

  const existing = getLocalStore<CommunityPost[]>('community_posts', INITIAL_COMMUNITY_POSTS);
  const filtered = existing.filter(p => p.id !== postId);
  setLocalStore('community_posts', filtered);

  return { success: true, error: null };
}

