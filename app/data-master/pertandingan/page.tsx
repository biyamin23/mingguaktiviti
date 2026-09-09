'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { 
  getCompetitions, 
  getTeachers, 
  createCompetition, 
  updateCompetition, 
  deleteCompetition 
} from '@/lib/supabase/service';
import { Competition, Teacher, CompetitionFormLevel } from '@/types/database';

export default function MasterPertandinganPage() {
  const toast = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterForm, setFilterForm] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [formLevel, setFormLevel] = useState<CompetitionFormLevel>(1);
  const [picTeacherId, setPicTeacherId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [comps, tchs] = await Promise.all([
        getCompetitions(),
        getTeachers(),
      ]);
      setCompetitions(comps);
      setTeachers(tchs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const teacherOptions: SelectOption[] = [
    { value: '', label: '— Tiada PIC Khusus —' },
    ...teachers.map(t => ({
      value: t.id,
      label: t.name,
      subLabel: `No. Gaji: ${t.salary_no}`
    }))
  ];

  const openAddModal = () => {
    setSelectedComp(null);
    setName('');
    setFormLevel(1);
    setPicTeacherId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Competition) => {
    setSelectedComp(comp);
    setName(comp.name);
    setFormLevel(comp.form);
    setPicTeacherId(comp.pic_teacher_id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Rule: Reject T5
    if (Number(formLevel) === 5) {
      setFormError('Tingkatan 5 tidak dibenarkan sama sekali untuk pertandingan.');
      return;
    }

    if (!name.trim()) {
      setFormError('Sila masukkan nama pertandingan.');
      return;
    }

    setSubmitting(true);

    if (selectedComp) {
      const res = await updateCompetition(selectedComp.id, {
        name: name.trim(),
        form: formLevel,
        pic_teacher_id: picTeacherId || null,
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Pertandingan berjaya dikemaskini.');
        setIsModalOpen(false);
        loadData();
      }
    } else {
      const res = await createCompetition({
        name: name.trim(),
        form: formLevel,
        pic_teacher_id: picTeacherId || null,
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Pertandingan baru berjaya ditambah.');
        setIsModalOpen(false);
        loadData();
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedComp) return;
    setSubmitting(true);
    const res = await deleteCompetition(selectedComp.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Pertandingan berjaya dipadam.');
      setIsDeleteModalOpen(false);
      setSelectedComp(null);
      loadData();
    }
  };

  const filteredCompetitions = competitions.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.pic?.name && c.pic.name.toLowerCase().includes(search.toLowerCase()));
    const matchForm = filterForm === 'all' || c.form === Number(filterForm);
    return matchSearch && matchForm;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FEF3C7] text-[#D97706]">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Data Master: Pertandingan
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pengurusan senarai rasmi pertandingan bagi Tingkatan 1 hingga 4. Tingkatan 5 dikecualikan sepenuhnya.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Pertandingan
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pertandingan atau PIC..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Semua Tingkatan (T1 – T4)</option>
              <option value="1">Tingkatan 1 Sahaja</option>
              <option value="2">Tingkatan 2 Sahaja</option>
              <option value="3">Tingkatan 3 Sahaja</option>
              <option value="4">Tingkatan 4 Sahaja</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Competitions Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Ting.</th>
              <th className="py-3 px-4">Nama Pertandingan</th>
              <th className="py-3 px-4">Guru Penyelaras (PIC)</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="p-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : filteredCompetitions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-[#94A3B8]">
                  Tiada pertandingan dijumpai.
                </td>
              </tr>
            ) : (
              filteredCompetitions.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                      T{c.form}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#172033]">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    {c.pic?.name || <span className="text-[#94A3B8] italic">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF]"
                        title="Edit Pertandingan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComp(c);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        title="Padam Pertandingan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedComp ? 'Kemaskini Pertandingan' : 'Tambah Pertandingan Baru'}
        description="Pertandingan hanya sah bagi Tingkatan 1 hingga 4 sahaja."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Tingkatan Sasaran <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={formLevel}
              onChange={(e) => setFormLevel(Number(e.target.value) as CompetitionFormLevel)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {[1, 2, 3, 4].map(f => (
                <option key={f} value={f}>Tingkatan {f}</option>
              ))}
            </select>
            <p className="text-[11px] text-[#64748B] mt-1">
              Tingkatan 5 tidak mempunyai pertandingan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Nama Pertandingan <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pementasan Cerpen, Slot Motivasi..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Guru Penyelaras (PIC)
            </label>
            <SearchableSelect
              options={teacherOptions}
              value={picTeacherId}
              onChange={(val) => setPicTeacherId(val)}
              placeholder="Pilih Guru PIC..."
              searchPlaceholder="Cari nama atau nombor gaji..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
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
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Padam Rekod Pertandingan"
        description="Adakah anda pasti mahu memadam pertandingan ini?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Jika pertandingan ini telah mempunyai keputusan yang direkodkan, sistem akan menghalang pemadaman bagi melindungi data keputusan dan ranking homeroom.
          </p>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
            <div className="font-bold text-[#172033]">{selectedComp?.name}</div>
            <div className="text-[#64748B]">Tingkatan {selectedComp?.form}</div>
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
              Ya, Padam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
