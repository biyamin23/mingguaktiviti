'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Copy, 
  Edit3, 
  Trash2, 
  Clock, 
  User, 
  Check, 
  LayoutList, 
  Table as TableIcon,
  AlertTriangle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { useToast } from '@/components/ui/toast';
import { 
  getScheduleSlots, 
  getTeachers, 
  createScheduleSlot, 
  updateScheduleSlot, 
  deleteScheduleSlot 
} from '@/lib/supabase/service';
import { ScheduleSlot, Teacher, FormLevel } from '@/types/database';
import { formatMalayDate, formatTimeRange } from '@/lib/utils';

export default function JadualPage() {
  const toast = useToast();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterForm, setFilterForm] = useState<string>('all');
  const [filterPic, setFilterPic] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-13');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [picTeacherId, setPicTeacherId] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<FormLevel[]>([1]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [slotsData, teachersData] = await Promise.all([
        getScheduleSlots(),
        getTeachers(),
      ]);
      setSlots(slotsData);
      setTeachers(teachersData);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuatkan data jadual.');
    } finally {
      setLoading(false);
    }
  }

  const teacherOptions: SelectOption[] = teachers.map(t => ({
    value: t.id,
    label: t.name,
    subLabel: `No. Gaji: ${t.salary_no} • ${t.role}`
  }));

  const openAddModal = () => {
    setSelectedSlot(null);
    setTitle('');
    setDate('2026-09-13');
    setStartTime('08:00');
    setEndTime('10:00');
    setPicTeacherId(teachers[0]?.id || '');
    setSelectedTargets([1]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setTitle(slot.title);
    setDate(slot.date);
    setStartTime(slot.start_time.substring(0, 5));
    setEndTime(slot.end_time.substring(0, 5));
    setPicTeacherId(slot.pic_teacher_id);
    setSelectedTargets(slot.targets?.map(t => t.form) || [1]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (slot: ScheduleSlot) => {
    setSelectedSlot(null); // Treat as new slot
    setTitle(`${slot.title} (Salinan)`);
    setDate(slot.date);
    setStartTime(slot.start_time.substring(0, 5));
    setEndTime(slot.end_time.substring(0, 5));
    setPicTeacherId(slot.pic_teacher_id);
    setSelectedTargets(slot.targets?.map(t => t.form) || [1]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleTarget = (form: FormLevel) => {
    if (selectedTargets.includes(form)) {
      if (selectedTargets.length === 1) {
        toast.info('Sila pilih sekurang-kurangnya satu tingkatan sasaran.');
        return;
      }
      setSelectedTargets(selectedTargets.filter(f => f !== form));
    } else {
      setSelectedTargets([...selectedTargets, form].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Sila masukkan Tajuk Slot.');
      return;
    }

    if (endTime <= startTime) {
      setFormError('Masa tamat mesti lebih lewat daripada masa mula.');
      return;
    }

    if (!picTeacherId) {
      setFormError('Sila pilih Guru Penyelaras (PIC).');
      return;
    }

    if (selectedTargets.length === 0) {
      setFormError('Sila pilih sekurang-kurangnya satu tingkatan sasaran.');
      return;
    }

    setSubmitting(true);

    if (selectedSlot) {
      // Update
      const res = await updateScheduleSlot(selectedSlot.id, {
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        pic_teacher_id: picTeacherId,
        targets: selectedTargets
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Slot jadual berjaya dikemaskini.');
        setIsModalOpen(false);
        loadData();
      }
    } else {
      // Create
      const res = await createScheduleSlot({
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        pic_teacher_id: picTeacherId,
        targets: selectedTargets
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Slot jadual berjaya dicipta.');
        setIsModalOpen(false);
        loadData();
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    const res = await deleteScheduleSlot(selectedSlot.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Slot jadual berjaya dipadam.');
      setIsDeleteModalOpen(false);
      setSelectedSlot(null);
      loadData();
    }
  };

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    const matchSearch = slot.title.toLowerCase().includes(search.toLowerCase()) ||
      (slot.pic?.name && slot.pic.name.toLowerCase().includes(search.toLowerCase()));

    const matchDate = filterDate === 'all' || slot.date === filterDate;
    const matchForm = filterForm === 'all' || slot.targets?.some(t => t.form === Number(filterForm));
    const matchPic = filterPic === 'all' || slot.pic_teacher_id === filterPic;

    return matchSearch && matchDate && matchForm && matchPic;
  });

  // Group by Date for default view
  const groupedByDate: Record<string, ScheduleSlot[]> = {};
  filteredSlots.forEach(slot => {
    if (!groupedByDate[slot.date]) {
      groupedByDate[slot.date] = [];
    }
    groupedByDate[slot.date].push(slot);
  });

  const uniqueDates = Array.from(new Set(slots.map(s => s.date))).sort();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Jadual Aktiviti Minggu Aktiviti
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pusat konfigurasi dan pengurusan masa, sasaran tingkatan, serta penyelaras (PIC) aktiviti.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'timeline' ? 'bg-white text-[#1646A0] shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
              }`}
              title="Paparan Garis Masa Mengikut Tarikh"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden md:inline">Garis Masa</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-[#1646A0] shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
              }`}
              title="Paparan Jadual Padat"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden md:inline">Jadual</span>
            </button>
          </div>

          <Button variant="primary" size="md" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Slot
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tajuk slot atau PIC..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Semua Tarikh</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>{formatMalayDate(d)}</option>
              ))}
            </select>
          </div>

          {/* Form Filter */}
          <div>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Semua Tingkatan (T1 – T5)</option>
              <option value="1">Tingkatan 1 Sahaja</option>
              <option value="2">Tingkatan 2 Sahaja</option>
              <option value="3">Tingkatan 3 Sahaja</option>
              <option value="4">Tingkatan 4 Sahaja</option>
              <option value="5">Tingkatan 5 Sahaja</option>
            </select>
          </div>

          {/* PIC Filter */}
          <div>
            <select
              value={filterPic}
              onChange={(e) => setFilterPic(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Semua PIC Guru</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada slot jadual. Tambah slot pertama."
          description="Rangka jadual aktiviti bagi 13 hingga 15 September 2026 atau hari-hari lain."
          actionLabel="+ Tambah Slot Jadual"
          onAction={openAddModal}
        />
      ) : viewMode === 'timeline' ? (
        /* Timeline Grouped By Date */
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([dateKey, daySlots]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1646A0] text-white font-bold text-xs shadow-xs">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>{formatMalayDate(dateKey)}</span>
                </div>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="text-xs font-semibold text-[#64748B]">
                  {daySlots.length} Aktiviti
                </span>
              </div>

              {/* Slot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daySlots.map(slot => (
                  <div
                    key={slot.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Time and Target Tags */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1646A0] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimeRange(slot.start_time, slot.end_time)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {slot.targets?.map(t => (
                            <span
                              key={t.form}
                              className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1]"
                            >
                              T{t.form}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-[#172033] mb-3 group-hover:text-[#1646A0] transition-colors">
                        {slot.title}
                      </h3>

                      {/* PIC */}
                      <div className="flex items-center gap-2 text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>PIC: <strong className="text-[#172033] font-medium">{slot.pic?.name || 'Belum Ditetapkan'}</strong></span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-4 mt-3 border-t border-[#F8FAFC]">
                      <button
                        onClick={() => handleDuplicate(slot)}
                        title="Salin Slot (Duplicate)"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF] text-xs flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Salin</span>
                      </button>
                      <button
                        onClick={() => openEditModal(slot)}
                        title="Edit Slot"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF] text-xs flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSlot(slot);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Padam Slot"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Padam</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Compact Table View */
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
              <tr>
                <th className="py-3 px-4">Tarikh</th>
                <th className="py-3 px-4">Masa</th>
                <th className="py-3 px-4">Tajuk Slot</th>
                <th className="py-3 px-4">Sasaran</th>
                <th className="py-3 px-4">PIC</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredSlots.map(slot => (
                <tr key={slot.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#172033] whitespace-nowrap">
                    {formatMalayDate(slot.date)}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] whitespace-nowrap font-mono">
                    {formatTimeRange(slot.start_time, slot.end_time)}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#172033]">
                    {slot.title}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {slot.targets?.map(t => (
                        <span
                          key={t.form}
                          className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]"
                        >
                          T{t.form}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    {slot.pic?.name || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(slot)}
                        title="Salin Slot"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(slot)}
                        title="Edit Slot"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSlot(slot);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Padam Slot"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create / Edit / Duplicate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSlot ? 'Kemaskini Slot Jadual' : 'Tambah Slot Jadual Baru'}
        description="Tetapkan butiran aktiviti, tarikh, masa, sasaran murid dan PIC."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Tajuk Slot */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Tajuk Slot / Aktiviti <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Slot Motivasi, Pementasan Cerpen..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* 2. Tarikh */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Tarikh Aktiviti <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="flex gap-2 mt-1.5">
              {['2026-09-13', '2026-09-14', '2026-09-15'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                    date === d ? 'bg-[#1646A0] text-white border-[#1646A0]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                  }`}
                >
                  {formatMalayDate(d)}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Masa Mula & Tamat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Masa Mula <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Masa Tamat <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* 4. Sasaran Tingkatan (Multi-select Chips [T1]..[T5]) */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Sasaran Tingkatan (Pilih satu atau lebih) <span className="text-[#DC2626]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4, 5] as FormLevel[]).map(form => {
                const isSelected = selectedTargets.includes(form);
                return (
                  <button
                    key={form}
                    type="button"
                    onClick={() => toggleTarget(form)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1646A0] text-white border-[#1646A0] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>Tingkatan {form}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Disimpan secara relasi dalam jadual <code>schedule_slot_targets</code>.
            </p>
          </div>

          {/* 5. PIC Searchable Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Guru Penyelaras (PIC) <span className="text-[#DC2626]">*</span>
            </label>
            <SearchableSelect
              options={teacherOptions}
              value={picTeacherId}
              onChange={(val) => setPicTeacherId(val)}
              placeholder="Pilih Guru PIC..."
              searchPlaceholder="Cari nama atau nombor gaji..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              {selectedSlot ? 'Simpan Perubahan' : 'Tambah Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Padam Slot Jadual"
        description="Adakah anda pasti mahu memadamkan slot jadual ini?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Tindakan ini tidak boleh diundur. Jika slot ini telah mempunyai rekod laporan bergambar, sistem akan menghalang pemadaman bagi memelihara integriti data sejarah.
          </p>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
            <div className="font-bold text-[#172033]">{selectedSlot?.title}</div>
            <div className="text-[11px] text-[#64748B]">{selectedSlot?.date && formatMalayDate(selectedSlot.date)}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={submitting}
            >
              Ya, Padam Slot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
