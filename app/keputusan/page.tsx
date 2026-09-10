'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  LogIn, 
  Check,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/session/auth-context';
import { useAdmin } from '@/lib/session/admin-context';
import { useToast } from '@/components/ui/toast';
import { 
  getCompetitions, 
  getHomeroomsByForm, 
  saveCompetitionResult, 
  deleteCompetitionResult,
  clearAllResults,
  getResults 
} from '@/lib/supabase/service';
import { Competition, Homeroom, Result, FormLevel } from '@/types/database';

export default function KeputusanPage() {
  const { user, openLoginModal } = useAuth();
  const { isAdmin, loginAdmin } = useAdmin();
  const toast = useToast();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [existingResults, setExistingResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selection
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');
  const [availableHomerooms, setAvailableHomerooms] = useState<Homeroom[]>([]);
  const [loadingHomerooms, setLoadingHomerooms] = useState(false);

  // 5 Placements: Johan, Naib, Ketiga, Keempat, Kelima
  const [placements, setPlacements] = useState<{
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  }>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete & Reset Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    loadCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCompetitions() {
    setLoading(true);
    try {
      const [comps, results] = await Promise.all([
        getCompetitions(),
        getResults(),
      ]);
      // Filter out T5 just in case
      const validComps = comps.filter(c => c.form <= 4);
      setCompetitions(validComps);
      setExistingResults(results);

      if (validComps.length > 0) {
        setSelectedCompetitionId(validComps[0].id);
        handleSelectCompetition(validComps[0].id, validComps);
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuatkan senarai pertandingan.');
    } finally {
      setLoading(false);
    }
  }

  const selectedCompetition = competitions.find(c => c.id === selectedCompetitionId);

  const handleSelectCompetition = async (compId: string, compList = competitions) => {
    setSelectedCompetitionId(compId);
    const targetComp = compList.find(c => c.id === compId);
    if (!targetComp) return;

    setLoadingHomerooms(true);
    // Reset placements
    setPlacements({ 1: '', 2: '', 3: '', 4: '', 5: '' });
    setFormError(null);

    try {
      const hrs = await getHomeroomsByForm(targetComp.form as FormLevel);
      setAvailableHomerooms(hrs);

      // Check if existing result exists for this competition
      const existing = existingResults.find(r => r.competition_id === compId);
      if (existing && existing.entries) {
        const prefill: any = { 1: '', 2: '', 3: '', 4: '', 5: '' };
        existing.entries.forEach(e => {
          if (e.placement && e.placement >= 1 && e.placement <= 5) {
            prefill[e.placement] = e.homeroom_id;
          }
        });
        setPlacements(prefill);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHomerooms(false);
    }
  };

  const handlePlacementChange = (position: 1 | 2 | 3 | 4 | 5, homeroomId: string) => {
    setPlacements(prev => ({
      ...prev,
      [position]: homeroomId,
    }));
    setFormError(null);
  };

  const validateBeforeConfirmation = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (!selectedCompetition) {
      setFormError('Sila pilih pertandingan.');
      return;
    }

    // Check all 5 are selected
    if (!placements[1] || !placements[2] || !placements[3] || !placements[4] || !placements[5]) {
      setFormError('Sila pilih kesemua 5 pemenang (Johan hingga Kelima).');
      return;
    }

    // Check no duplicates
    const selectedIds = [placements[1], placements[2], placements[3], placements[4], placements[5]];
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== 5) {
      setFormError('Sebuah homeroom tidak boleh memenangi lebih daripada satu kedudukan.');
      return;
    }

    setFormError(null);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAndSave = async () => {
    if (!user || !selectedCompetition) return;

    setSubmitting(true);
    try {
      const placementList: { placement: 1 | 2 | 3 | 4 | 5; homeroom_id: string }[] = [
        { placement: 1, homeroom_id: placements[1] },
        { placement: 2, homeroom_id: placements[2] },
        { placement: 3, homeroom_id: placements[3] },
        { placement: 4, homeroom_id: placements[4] },
        { placement: 5, homeroom_id: placements[5] },
      ];

      const res = await saveCompetitionResult({
        competition_id: selectedCompetition.id,
        entered_by_teacher_id: user.id,
        placements: placementList,
      });

      setSubmitting(false);

      if (res.error) {
        setFormError(res.error);
        setIsConfirmModalOpen(false);
        toast.error(res.error);
      } else {
        toast.success(`Keputusan bagi ${selectedCompetition.name} berjaya disahkan & disimpan!`);
        setIsConfirmModalOpen(false);
        // Refresh
        const results = await getResults();
        setExistingResults(results);
      }
    } catch (e: any) {
      setSubmitting(false);
      setIsConfirmModalOpen(false);
      toast.error('Ralat: ' + e.message);
    }
  };

  const handleDeleteCompetitionResult = async () => {
    if (!selectedCompetition) return;
    setDeleting(true);
    const res = await deleteCompetitionResult(selectedCompetition.id);
    setDeleting(false);
    setIsDeleteModalOpen(false);

    if (res.success) {
      toast.success(`Keputusan bagi ${selectedCompetition.name} berjaya dipadam.`);
      setPlacements({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      const results = await getResults();
      setExistingResults(results);
    } else {
      toast.error(res.error || 'Gagal memadam keputusan.');
    }
  };

  const handleClearAllResults = async () => {
    if (!isAdmin) {
      const loginRes = loginAdmin(resetAdminPassword);
      if (!loginRes.success) {
        setResetError(loginRes.error || 'Kata laluan pentadbir tidak tepat.');
        return;
      }
    }

    setDeleting(true);
    const res = await clearAllResults();
    setDeleting(false);

    if (res.success) {
      toast.success('Semua data keputusan pemenang berjaya dikosongkan!');
      setIsResetAllModalOpen(false);
      setResetAdminPassword('');
      setResetError('');
      setPlacements({ 1: '', 2: '', 3: '', 4: '', 5: '' });
      setExistingResults([]);
    } else {
      setResetError(res.error || 'Gagal mengosongkan keputusan.');
      toast.error(res.error || 'Gagal mengosongkan keputusan.');
    }
  };

  const participatingCount = Math.max(0, availableHomerooms.length - 5);

  const getHomeroomName = (id: string) => {
    const found = availableHomerooms.find(h => h.id === id);
    return found ? found.name : '—';
  };

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
              Perekodan Keputusan Pertandingan
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pemberian mata merit rasmi bagi tempat 1 hingga 5 serta merit penyertaan automatik untuk semua homeroom.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {existingResults.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setResetAdminPassword('');
                setResetError('');
                setIsResetAllModalOpen(true);
              }}
              className="text-[#DC2626] border-[#FECACA] bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Kosongkan Semua Keputusan ({existingResults.length})
            </Button>
          )}

          {/* User Session Requirement Banner */}
          {!user && (
            <Button variant="gold" size="sm" onClick={openLoginModal}>
              <LogIn className="w-4 h-4 mr-1.5" />
              Login Untuk Merekod
            </Button>
          )}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Competition Selection & Rules */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Pilih Pertandingan</CardTitle>
              <p className="text-xs text-[#64748B]">
                Hanya pertandingan Tingkatan 1 hingga 4 disenaraikan.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : competitions.length === 0 ? (
                <div className="text-xs text-[#64748B]">
                  Tiada pertandingan aktif dijumpai.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Senarai Pertandingan
                  </label>
                  <select
                    value={selectedCompetitionId}
                    onChange={(e) => handleSelectCompetition(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {competitions.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        [T{comp.form}] {comp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCompetition && (
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Tingkatan Sasaran:</span>
                    <Badge variant="royal">Tingkatan {selectedCompetition.form}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Homeroom Bertanding:</span>
                    <span className="font-bold text-[#172033]">{availableHomerooms.length} Homeroom</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Status Keputusan:</span>
                    {existingResults.some(r => r.competition_id === selectedCompetition.id) ? (
                      <Badge variant="success">Telah Direkodkan</Badge>
                    ) : (
                      <Badge variant="warning">Belum Direkodkan</Badge>
                    )}
                  </div>
                  {existingResults.some(r => r.competition_id === selectedCompetition.id) && (
                    <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] text-xs h-8 w-full"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Padam Keputusan Pertandingan Ini
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Merit Scoring Matrix Reference Card */}
          <Card className="bg-gradient-to-br from-[#0B2F6B]/5 to-[#1646A0]/10 border-[#BFDBFE]">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[#1646A0]" />
              <h3 className="text-xs font-bold text-[#0B2F6B] uppercase tracking-wider">
                Sistem Pemarkahan Merit (Terkunci)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Johan</span>
                <strong className="text-[#D97706]">100 M</strong>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Naib Johan</span>
                <strong className="text-[#475569]">70 M</strong>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Ketiga</span>
                <strong className="text-[#B45309]">40 M</strong>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Keempat</span>
                <strong className="text-[#1646A0]">30 M</strong>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Kelima</span>
                <strong className="text-[#1646A0]">20 M</strong>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex justify-between">
                <span className="text-[#64748B]">Penyertaan</span>
                <strong className="text-[#15803D]">10 M</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: 5 Placements Input */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">2. Tetapkan 5 Pemenang Utama</CardTitle>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pilih homeroom yang menepati setiap kedudukan. Kesemua 5 kedudukan wajib diisi.
                  </p>
                </div>
                {selectedCompetition && (
                  <Badge variant="royal">
                    T{selectedCompetition.form} • {availableHomerooms.length} Homeroom
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {formError && (
                <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {loadingHomerooms ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : availableHomerooms.length < 5 ? (
                <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                  Tingkatan ini mempunyai kurang daripada 5 homeroom ({availableHomerooms.length} dijumpai). Sila daftarkan sekurang-kurangnya 5 homeroom dalam Data Master Homeroom.
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { pos: 1, title: 'Johan', merit: '100 Merit', badge: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]', medalColor: 'text-[#D97706]' },
                    { pos: 2, title: 'Naib Johan', merit: '70 Merit', badge: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]', medalColor: 'text-[#64748B]' },
                    { pos: 3, title: 'Tempat Ketiga', merit: '40 Merit', badge: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]', medalColor: 'text-[#B45309]' },
                    { pos: 4, title: 'Tempat Keempat', merit: '30 Merit', badge: 'bg-[#EFF6FF] text-[#1646A0] border-[#BFDBFE]', medalColor: 'text-[#2563EB]' },
                    { pos: 5, title: 'Tempat Kelima', merit: '20 Merit', badge: 'bg-[#EFF6FF] text-[#1646A0] border-[#BFDBFE]', medalColor: 'text-[#2563EB]' },
                  ].map((tier) => {
                    const pos = tier.pos as 1 | 2 | 3 | 4 | 5;
                    const currentValue = placements[pos];

                    return (
                      <div
                        key={tier.pos}
                        className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${tier.badge} border flex items-center justify-center font-black text-sm shrink-0`}>
                            {tier.pos}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#172033] flex items-center gap-2">
                              <span>{tier.title}</span>
                              <span className="text-[10px] font-semibold text-[#1646A0] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                                {tier.merit}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#64748B]">
                              Homeroom pemenang
                            </span>
                          </div>
                        </div>

                        <div className="sm:w-64">
                          <select
                            value={currentValue}
                            onChange={(e) => handlePlacementChange(pos, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          >
                            <option value="">— Pilih Homeroom —</option>
                            {availableHomerooms.map((hr) => {
                              // Mark if selected in another tier
                              const isTaken = Object.entries(placements).some(
                                ([k, v]) => Number(k) !== pos && v === hr.id
                              );
                              return (
                                <option
                                  key={hr.id}
                                  value={hr.id}
                                  disabled={isTaken}
                                >
                                  {hr.name} {isTaken ? '(Dipilih)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary note for participation merit */}
                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#15803D] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#16A34A]" />
                    <span>
                      <strong>{participatingCount} homeroom selebihnya</strong> dalam Tingkatan {selectedCompetition?.form} akan menerima <strong>10 Merit penyertaan secara automatik</strong>.
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 flex justify-end">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={validateBeforeConfirmation}
                      disabled={!user}
                      className="w-full sm:w-auto"
                    >
                      <span>Semak Senarai Pemenang</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal (Section 33) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Pengesahan Keputusan Pertandingan"
        description="Sila semak semula senarai pemenang sebelum menyimpan ke dalam pangkalan data rasmi."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Pertandingan:</span>
              <strong className="text-[#172033]">{selectedCompetition?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Tingkatan:</span>
              <strong>Tingkatan {selectedCompetition?.form}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Guru Pelapor:</span>
              <strong className="text-[#1646A0]">{user?.name} ({user?.salary_no})</strong>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-[#172033]">
              Senarai Pemenang Utama:
            </div>
            {[
              { pos: 1, label: 'Johan', merit: 100, badge: 'bg-[#FEF3C7] text-[#92400E]' },
              { pos: 2, label: 'Naib Johan', merit: 70, badge: 'bg-[#F1F5F9] text-[#334155]' },
              { pos: 3, label: 'Ketiga', merit: 40, badge: 'bg-[#FFEDD5] text-[#9A3412]' },
              { pos: 4, label: 'Keempat', merit: 30, badge: 'bg-[#EFF6FF] text-[#1646A0]' },
              { pos: 5, label: 'Kelima', merit: 20, badge: 'bg-[#EFF6FF] text-[#1646A0]' },
            ].map(item => (
              <div
                key={item.pos}
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] text-xs bg-white"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.badge}`}>
                    {item.label}
                  </span>
                  <span className="font-bold text-[#172033]">
                    {getHomeroomName(placements[item.pos as 1 | 2 | 3 | 4 | 5])}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#1646A0]">
                  +{item.merit} M
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] text-xs text-[#15803D]">
            Sebanyak <strong>{participatingCount} homeroom</strong> yang lain akan menerima <strong>10 mata merit penyertaan</strong>.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAndSave}
              isLoading={submitting}
            >
              <Check className="w-4 h-4 mr-1.5" />
              Ya, Sahkan & Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Single Competition Result Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Padam Keputusan Pertandingan?"
        description="Pengesahan untuk memadam keputusan bagi pertandingan yang dipilih."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#FEF2F2] rounded-xl border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Amaran Pemadaman Keputusan</p>
              <p className="mt-0.5 text-xs text-[#B91C1C]">
                Tindakan ini akan memadam rekod pemenang bagi <strong>{selectedCompetition?.name}</strong> dan menarik balik mata merit yang telah diberikan kepada semua homeroom bertanding.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteCompetitionResult}
              isLoading={deleting}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Ya, Padam Keputusan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset All Results Modal */}
      <Modal
        isOpen={isResetAllModalOpen}
        onClose={() => {
          setIsResetAllModalOpen(false);
          setResetAdminPassword('');
          setResetError('');
        }}
        title="Kosongkan Semua Data Pemenang?"
        description="Tindakan ini akan memadam kesemua rekod keputusan dan mengembalikan jadual ranking kepada kosong."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#FEF2F2] rounded-xl border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Amaran Pengosongan Menyeluruh</p>
              <p className="mt-0.5 text-xs text-[#B91C1C]">
                Tindakan ini akan memadam <strong>semua keputusan ({existingResults.length} pertandingan)</strong> dan mengosongkan semua mata merit kumulatif dalam carta kedudukan (*ranking*).
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#172033]">
                Kata Laluan Pentadbir (Admin)
              </label>
              <input
                type="password"
                value={resetAdminPassword}
                onChange={(e) => {
                  setResetAdminPassword(e.target.value);
                  if (resetError) setResetError('');
                }}
                placeholder="Masukkan kata laluan admin"
                className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              {resetError && (
                <p className="text-xs text-[#DC2626]">{resetError}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsResetAllModalOpen(false);
                setResetAdminPassword('');
                setResetError('');
              }}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClearAllResults}
              isLoading={deleting}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Sahkan Kosongkan Semua
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
