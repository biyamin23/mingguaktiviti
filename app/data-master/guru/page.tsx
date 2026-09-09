'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
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
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/lib/supabase/service';
import { Teacher } from '@/types/database';

export default function MasterGuruPage() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [salaryNo, setSalaryNo] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Guru');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setSelectedTeacher(null);
    setSalaryNo('');
    setName('');
    setRole('Guru');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setSelectedTeacher(t);
    setSalaryNo(t.salary_no);
    setName(t.name);
    setRole(t.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!salaryNo.trim() || !name.trim()) {
      setFormError('Sila isi semua ruangan wajib.');
      return;
    }

    setSubmitting(true);

    if (selectedTeacher) {
      const res = await updateTeacher(selectedTeacher.id, {
        salary_no: salaryNo.trim().toUpperCase(),
        name: name.trim(),
        role: role.trim()
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Maklumat guru berjaya dikemaskini.');
        setIsModalOpen(false);
        loadData();
      }
    } else {
      const res = await createTeacher({
        salary_no: salaryNo.trim().toUpperCase(),
        name: name.trim(),
        role: role.trim()
      });
      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        toast.success('Guru baru berjaya ditambah.');
        setIsModalOpen(false);
        loadData();
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;
    setSubmitting(true);
    const res = await deleteTeacher(selectedTeacher.id);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Guru berjaya dipadam.');
      setIsDeleteModalOpen(false);
      setSelectedTeacher(null);
      loadData();
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.salary_no.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Data Master: Guru
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pengurusan senarai guru, pengesahan nombor gaji unik, dan peranan dalam portal.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Guru
        </Button>
      </div>

      {/* Search Card */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guru mengikut nama, nombor gaji, atau jawatan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Bil</th>
              <th className="py-3 px-4">Nombor Gaji</th>
              <th className="py-3 px-4">Nama Guru</th>
              <th className="py-3 px-4">Peranan / Jawatan</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="p-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                  Tiada guru dijumpai.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-[#94A3B8]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1646A0]">
                    {t.salary_no}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#172033]">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">
                    {t.role}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1646A0] hover:bg-[#EFF6FF]"
                        title="Edit Guru"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(t);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        title="Padam Guru"
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
        title={selectedTeacher ? 'Kemaskini Maklumat Guru' : 'Tambah Guru Baru'}
        description="Pastikan nombor gaji adalah tepat dan unik bagi membolehkan log masuk."
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
              Nombor Gaji <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={salaryNo}
              onChange={(e) => setSalaryNo(e.target.value)}
              placeholder="Contoh: G1001"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Nama Penuh Guru <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Cikgu Ahmad Faris bin Zulkifli"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Peranan / Jawatan
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Guru, Penasihat Homeroom, Ketua Bidang..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
        title="Padam Rekod Guru"
        description="Adakah anda pasti mahu memadam guru ini?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B] leading-relaxed">
            Sistem akan menyemak jika guru ini sedang digunakan sebagai Penasihat Homeroom atau PIC jadual. Jika ada kaitan aktif, pemadaman akan dihalang demi keselamatan data.
          </p>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
            <div className="font-bold text-[#172033]">{selectedTeacher?.name}</div>
            <div className="text-[#1646A0] font-mono">{selectedTeacher?.salary_no}</div>
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
              Ya, Padam Guru
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
