'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Check, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { getMeritSettings, updateMeritSettings } from '@/lib/supabase/service';

export default function TetapanMeritPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Editable points state
  const [pointsState, setPointsState] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getMeritSettings();
      const initialMap: Record<string, number> = {};
      data.forEach(item => {
        initialMap[item.placement] = item.points;
      });
      setPointsState(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handlePointChange = (placement: string, val: number) => {
    setPointsState(prev => ({
      ...prev,
      [placement]: isNaN(val) ? 0 : val
    }));
  };

  const handleResetToStandard = () => {
    setPointsState({
      'Johan': 100,
      'Naib Johan': 70,
      'Ketiga': 40,
      'Keempat': 30,
      'Kelima': 20,
      'Penyertaan': 10
    });
    toast.info('Nilai telah ditetapkan semula kepada spesifikasi piawai.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = Object.entries(pointsState).map(([placement, points]) => ({
      placement,
      points: Number(points)
    }));

    const res = await updateMeritSettings(payload);
    setSubmitting(false);

    if (res.success) {
      toast.success('Tetapan merit berjaya dikemaskini.');
      loadData();
    } else {
      toast.error('Gagal mengemaskini tetapan merit.');
    }
  };

  const placementStyles: Record<string, { badge: string; text: string }> = {
    'Johan': { badge: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]', text: 'Pemenang Tempat Pertama' },
    'Naib Johan': { badge: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]', text: 'Pemenang Tempat Kedua' },
    'Ketiga': { badge: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]', text: 'Pemenang Tempat Ketiga' },
    'Keempat': { badge: 'bg-[#EFF6FF] text-[#1646A0] border-[#BFDBFE]', text: 'Pemenang Tempat Keempat' },
    'Kelima': { badge: 'bg-[#EFF6FF] text-[#1646A0] border-[#BFDBFE]', text: 'Pemenang Tempat Kelima' },
    'Penyertaan': { badge: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', text: 'Semua Homeroom Yang Menyertai' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Data Master: Tetapan Merit
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Konfigurasi mata merit bagi setiap penempatan (100 / 70 / 40 / 30 / 20 / 10).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToStandard}
          className="gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tetapkan Semula Piawai</span>
        </Button>
      </div>

      {/* Info Notice about Historical Data Preservation */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 text-xs text-[#1E40AF]">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#1646A0] mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold block text-[#0B2F6B] mb-0.5">Integriti Skor Sejarah Terpelihara</strong>
          Setiap keputusan pertandingan menyimpan mata merit semasa secara bebas di dalam rekod <code>result_entries.merit</code>. Perubahan pada tetapan ini hanya mempengaruhi pertandingan yang direkodkan selepas ini dan tidak mengubah markah sejarah yang telah disahkan.
        </div>
      </div>

      {/* Merit Matrix Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skema Pemarkahan Merit Acara</CardTitle>
          <p className="text-xs text-[#64748B]">
            Nilai mata merit yang akan dianugerahkan kepada homeroom mengikut kedudukan.
          </p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Johan', 'Naib Johan', 'Ketiga', 'Keempat', 'Kelima', 'Penyertaan'].map((placement) => {
                  const style = placementStyles[placement] || { badge: '', text: '' };
                  const currentVal = pointsState[placement] ?? 0;

                  return (
                    <div
                      key={placement}
                      className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style.badge}`}>
                          {placement}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Mata Semasa
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] text-[#64748B] mb-1">
                          {style.text}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            required
                            value={currentVal}
                            onChange={(e) => handlePointChange(placement, parseInt(e.target.value, 10))}
                            className="w-full px-3.5 py-2 text-base font-bold font-mono text-[#1646A0] bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                          />
                          <span className="absolute right-3.5 text-xs font-semibold text-[#94A3B8]">
                            Mata
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={submitting}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Tetapan Merit</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
