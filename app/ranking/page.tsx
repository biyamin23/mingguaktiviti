'use client';

import React, { useState, useEffect } from 'react';
import {
  Medal,
  Crown,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { getRankingByForm } from '@/lib/supabase/service';
import { HomeroomRanking, FormLevel } from '@/types/database';

export default function RankingPage() {
  const [activeForm, setActiveForm] = useState<FormLevel>(1);
  const [rankings, setRankings] = useState<HomeroomRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomeroom, setSelectedHomeroom] = useState<HomeroomRanking | null>(null);

  useEffect(() => {
    async function loadRanking() {
      setLoading(true);
      try {
        const data = await getRankingByForm(activeForm);
        setRankings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRanking();
  }, [activeForm]);

  const topThree = rankings.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Medal className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Ranking & Kedudukan Merit Homeroom
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Pungutan mata merit kumulatif sepanjang Minggu Aktiviti Semester 2 MRSM Tumpat 2026.
          </p>
        </div>

        {/* Form Switcher Tabs (T1 – T4 only, no T5) */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
          {([1, 2, 3, 4] as FormLevel[]).map(form => (
            <button
              key={form}
              onClick={() => setActiveForm(form)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeForm === form
                ? 'bg-white text-[#1646A0] shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
                }`}
            >
              Tingkatan {form}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : rankings.length === 0 ? (
        <Card className="p-12 text-center text-xs text-[#64748B]">
          Ranking akan dipaparkan selepas keputusan direkodkan bagi Tingkatan {activeForm}.
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* 2nd Place (Silver) */}
            {topThree[1] && (
              <div
                onClick={() => setSelectedHomeroom(topThree[1])}
                className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden order-2 md:order-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-bl-full -z-0" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border-2 border-[#94A3B8] text-[#334155] flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                    #2
                  </div>
                  <Badge variant="silver" size="sm" className="mb-2">Naib Johan</Badge>
                  <h3 className="text-base font-bold text-[#172033]">{topThree[1].homeroom_name}</h3>
                  <p className="text-xs text-[#64748B] mb-3">{topThree[1].advisor_name}</p>
                  <div className="text-2xl font-black text-[#334155]">
                    {topThree[1].total_merit}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">Merit</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {topThree[0] && (
              <div
                onClick={() => setSelectedHomeroom(topThree[0])}
                className="bg-gradient-to-b from-[#FFFDF0] to-white rounded-2xl border-2 border-[#FBBF24] p-6 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden order-1 md:order-2 scale-100 md:scale-105"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#FEF3C7]/40 rounded-bl-full -z-0" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#FBBF24] text-[#78350F] flex items-center justify-center font-black text-lg mb-2 shadow-sm">
                    <Crown className="w-6 h-6" />
                  </div>
                  <Badge variant="gold" size="sm" className="mb-2">#1 Johan</Badge>
                  <h3 className="text-lg font-extrabold text-[#172033]">{topThree[0].homeroom_name}</h3>
                  <p className="text-xs text-[#64748B] mb-4">{topThree[0].advisor_name}</p>
                  <div className="text-3xl font-black text-[#D97706]">
                    {topThree[0].total_merit}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">Merit</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {topThree[2] && (
              <div
                onClick={() => setSelectedHomeroom(topThree[2])}
                className="bg-white rounded-2xl border border-[#FED7AA] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden order-3"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -z-0" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFEDD5] border-2 border-[#FB923C] text-[#9A3412] flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                    #3
                  </div>
                  <Badge variant="bronze" size="sm" className="mb-2">Tempat Ketiga</Badge>
                  <h3 className="text-base font-bold text-[#172033]">{topThree[2].homeroom_name}</h3>
                  <p className="text-xs text-[#64748B] mb-3">{topThree[2].advisor_name}</p>
                  <div className="text-2xl font-black text-[#9A3412]">
                    {topThree[2].total_merit}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">Merit</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Ranking Table */}
          <Card className="overflow-x-auto p-0">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1646A0]" />
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Kedudukan Penuh Homeroom Tingkatan {activeForm}
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">
                Klik pada baris untuk perincian pungutan merit
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Kedudukan</th>
                  <th className="py-3 px-4">Homeroom</th>
                  <th className="py-3 px-4">Guru Penasihat</th>
                  <th className="py-3 px-4 text-center">Penyertaan</th>
                  <th className="py-3 px-4 text-right">Jumlah Merit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rankings.map(item => {
                  const isGold = item.rank === 1 && item.total_merit > 0;
                  const isSilver = item.rank === 2 && item.total_merit > 0;
                  const isBronze = item.rank === 3 && item.total_merit > 0;

                  return (
                    <tr
                      key={item.homeroom_id}
                      onClick={() => setSelectedHomeroom(item)}
                      className="hover:bg-[#EFF6FF]/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${isGold
                            ? 'bg-[#FBBF24] text-[#78350F]'
                            : isSilver
                              ? 'bg-[#E2E8F0] text-[#334155]'
                              : isBronze
                                ? 'bg-[#FFEDD5] text-[#9A3412]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#172033]">
                        {item.homeroom_name}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {item.advisor_name}
                      </td>
                      <td className="py-3 px-4 text-center text-[#64748B]">
                        {item.breakdown.length} Aktiviti
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-sm text-[#1646A0]">
                        {item.total_merit} M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Breakdown Details Modal */}
      <Modal
        isOpen={Boolean(selectedHomeroom)}
        onClose={() => setSelectedHomeroom(null)}
        title={selectedHomeroom ? `Perincian Merit: ${selectedHomeroom.homeroom_name}` : 'Perincian'}
        description={`Penasihat: ${selectedHomeroom?.advisor_name} • Tingkatan ${selectedHomeroom?.form}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1646A0]">Pungutan Keseluruhan:</span>
            <span className="text-xl font-black text-[#1646A0]">
              {selectedHomeroom?.total_merit} Merit
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-[#172033]">
              Pecahan Mengikut Pertandingan:
            </div>
            {selectedHomeroom?.breakdown.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-xl">
                Belum ada rekod pertandingan bagi homeroom ini.
              </div>
            ) : (
              selectedHomeroom?.breakdown.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] text-xs bg-white"
                >
                  <div>
                    <div className="font-bold text-[#172033]">{b.competition_name}</div>
                    <div className="text-[11px] text-[#64748B]">
                      {b.placement ? `Tempat Ke-${b.placement}` : 'Merit Penyertaan Rasmi'}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-[#1646A0] bg-[#EFF6FF] px-2 py-1 rounded-md">
                    +{b.merit} M
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedHomeroom(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
