'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { 
  getHomerooms, 
  getTeachers, 
  createHomeroom, 
  updateHomeroom, 
  deleteHomeroom 
} from '@/lib/supabase/service';
import { Homeroom, Teacher, FormLevel } from '@/types/database';

export default function MasterHomeroomPage() {
  const toast = useToast();
  const [homerooms, setHomerooms] = useState<Homeroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterForm, setFilterForm] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHomeroom, setSelectedHomeroom] = useState<Homeroom | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formLevel, setFormLevel] = useState<FormLevel>(1);
  const [name, setName] = useState('');
  const [advisorTeacherId, setAdvisorTeacherId] = useState<string | null>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [hrs, tchs] = await Promise.all([
        getHomerooms(),
        getTeachers(),
      ]);
      setHomerooms(hrs);
      setTeachers(tchs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Advisor dropdown: Show unassigned teachers. While editing: include current advisor.
  const getAvailableAdvisors = () => {
    const assignedTeacherIds = new Set(
      homerooms
        .filter(h => !selectedHomeroom || h.id !== selectedHomeroom.id)
        .map(h => h.advisor_teacher_id)
        .filter(Boolean)
    );

    const available = teachers.filter(t => !assignedTeacherIds.has(t.id));

    const options: SelectOption[] = available.map(t => ({
      value: t.id,
      label: t.name,
      subLabel: `No. Gaji: ${t.salary_no}`
    }));

    return [{ value: '', label: '— Tiada Penasihat (Kosong) —' }, ...options];
  };

  const openAddModal = () => {
    setSelectedHomeroom(null);
    setFormLevel(1);
    setName('');
    setAdvisorTeacherId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (hr: Homeroom) => {
    setSelectedHomeroom(hr);
    setFormLevel(hr.form);
    setName(hr.name);
    setAdvisorTeacherId(hr.advisor_teacher_id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Sila masukkan nama homeroom.');
      return;
    }

    setSubmitting(true);

    if (selectedHomeroom) {
      const res = await updateHomeroom(selectedHomeroom.id, {
        form: formLevel,
        name: name.trim(),
        advisor_teacher_id: advisorTeacherId || null,
        needs_review: false,
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Homeroom berjaya dikemaskini.');
        setIsModalOpen(false);
        loadData();
      }
    } else {
      const res = await createHomeroom({
        form: formLevel,
        name: name.trim(),
        advisor_teacher_id: advisorTeacherId || null,
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Homeroom baru berjaya ditambah.');
        setIsModalOpen(false);
        loadData();
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedHomeroom) return;
    setSubmitting(true);
    const res = await deleteHomeroom(selectedHomeroom.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Homeroom berjaya dipadam.');
      setIsDeleteModalOpen(false);
      setSelectedHomeroom(null);
      loadData();
    }
  };

  const filteredHomerooms = homerooms.filter(hr => {
    const matchSearch = hr.name.toLowerCase().includes(search.toLowerCase()) ||
      (hr.advisor?.name && hr.advisor.name.toLowerCase().includes(search.toLowerCase())) ||
      (hr.advisor?.salary_no && hr.advisor.salary_no.toLowerCase().includes(search.toLowerCase()));

    const matchForm = filterForm === 'all' || hr.form === Number(filterForm);
    return matchSearch && matchForm;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Home className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Data Master: Homeroom
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pengurusan kelas homeroom Tingkatan 1 hingga 5 dan penetapan guru penasihat tunggal.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Homeroom
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
              placeholder="Cari nama homeroom, penasihat, atau no. gaji..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

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
        </div>
      </Card>

      {/* Homerooms Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Ting.</th>
              <th className="py-3 px-4">Nama Homeroom</th>
              <th className="py-3 px-4">Guru Penasihat</th>
              <th className="py-3 px-4">Nombor Gaji</th>
              <th className="py-3 px-4">Status Integriti</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="p-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : filteredHomerooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#94A3B8]">
                  Tiada homeroom dijumpai.
                </td>
              </tr>
            ) : (
              filteredHomerooms.map((hr) => (
                <tr key={hr.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                      T{hr.form}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#172033]">
                    {hr.name}
                  </td>
                  <td className="py-3 px-4 text-[#334155]">
                    {hr.advisor?.name || (
                      <span className="text-[#94A3B8] italic">Belum Ditetapkan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#1646A0]">
                    {hr.advisor?.salary_no || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {hr.needs_review ? (
                      <Badge variant="warning">Perlu Semakan Data</Badge>
                    ) : (
                      <Badge variant="success">Disahkan</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(hr)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF]"
                        title="Edit Homeroom"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHomeroom(hr);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        title="Padam Homeroom"
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
        title={selectedHomeroom ? 'Kemaskini Homeroom' : 'Tambah Homeroom Baru'}
        description="Satu guru hanya boleh dilantik sebagai penasihat kepada satu homeroom sahaja."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Tingkatan <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={formLevel}
              onChange={(e) => setFormLevel(Number(e.target.value) as FormLevel)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {[1, 2, 3, 4, 5].map(f => (
                <option key={f} value={f}>Tingkatan {f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Nama Homeroom <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: 1 Al-Farabi"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Guru Penasihat (Hanya guru yang belum ada homeroom dipaparkan)
            </label>
            <SearchableSelect
              options={getAvailableAdvisors()}
              value={advisorTeacherId || ''}
              onChange={(val) => setAdvisorTeacherId(val)}
              placeholder="Pilih Guru Penasihat..."
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
        title="Padam Rekod Homeroom"
        description="Adakah anda pasti mahu memadam homeroom ini?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Jika homeroom ini telah mempunyai markah merit atau rekod keputusan pertandingan, sistem akan menghalang pemadaman bagi melindungi data sejarah.
          </p>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
            <div className="font-bold text-[#172033]">{selectedHomeroom?.name}</div>
            <div className="text-[#64748B]">Tingkatan {selectedHomeroom?.form}</div>
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
              Ya, Padam Homeroom
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
