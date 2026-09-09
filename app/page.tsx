'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/layout/hero-banner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Home, 
  CalendarDays, 
  Trophy, 
  FileCheck2, 
  Camera, 
  ArrowRight, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import { 
  getTeachers, 
  getHomerooms, 
  getCompetitions, 
  getScheduleSlots, 
  getResults, 
  getReports, 
  getRankingByForm 
} from '@/lib/supabase/service';
import { 
  ScheduleSlot, 
  Result, 
  Report, 
  HomeroomRanking 
} from '@/types/database';
import { formatMalayDate, formatTimeRange } from '@/lib/utils';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teachersCount: 0,
    homeroomsCount: 0,
    slotsCount: 0,
    competitionsCount: 0,
    resultsCount: 0,
    reportsCount: 0,
  });

  const [nextActivities, setNextActivities] = useState<ScheduleSlot[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  // 4-column ranking for T1, T2, T3, T4
  const [rankingsT1, setRankingsT1] = useState<HomeroomRanking[]>([]);
  const [rankingsT2, setRankingsT2] = useState<HomeroomRanking[]>([]);
  const [rankingsT3, setRankingsT3] = useState<HomeroomRanking[]>([]);
  const [rankingsT4, setRankingsT4] = useState<HomeroomRanking[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [
          teachers,
          homerooms,
          competitions,
          slots,
          results,
          reports,
          r1,
          r2,
          r3,
          r4
        ] = await Promise.all([
          getTeachers(),
          getHomerooms(),
          getCompetitions(),
          getScheduleSlots(),
          getResults(),
          getReports(),
          getRankingByForm(1),
          getRankingByForm(2),
          getRankingByForm(3),
          getRankingByForm(4),
        ]);

        setStats({
          teachersCount: teachers.length,
          homeroomsCount: homerooms.length,
          slotsCount: slots.length,
          competitionsCount: competitions.length,
          resultsCount: results.length,
          reportsCount: reports.length,
        });

        // Next 4 activities
        setNextActivities(slots.slice(0, 4));

        // Recent 3 results
        setRecentResults(results.slice(0, 3));

        // Recent 3 reports
        setRecentReports(reports.slice(0, 3));

        setRankingsT1(r1);
        setRankingsT2(r2);
        setRankingsT3(r3);
        setRankingsT4(r4);
      } catch (e) {
        console.error('Error loading dashboard data', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    { label: 'Jumlah Guru', value: stats.teachersCount, icon: Users, color: 'text-[#1646A0]', bg: 'bg-[#EFF6FF]' },
    { label: 'Jumlah Homeroom', value: stats.homeroomsCount, icon: Home, color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
    { label: 'Slot Jadual', value: stats.slotsCount, icon: CalendarDays, color: 'text-[#0284C7]', bg: 'bg-[#F0F9FF]' },
    { label: 'Pertandingan', value: stats.competitionsCount, icon: Trophy, color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
    { label: 'Keputusan Direkod', value: stats.resultsCount, icon: FileCheck2, color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
    { label: 'Laporan Bergambar', value: stats.reportsCount, icon: Camera, color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Statistical Metric Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#172033] tracking-tight">
            Ringkasan Statistik Pusat Kawalan
          </h2>
          <span className="text-xs font-semibold text-[#64748B]">
            Semester 2 • 2026
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl ${st.bg} ${st.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <div className="text-2xl font-extrabold text-[#172033] tracking-tight">
                      {st.value}
                    </div>
                  )}
                  <div className="text-xs font-medium text-[#64748B] mt-0.5">
                    {st.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SIMULTANEOUS 4-COLUMN RANKING (T1, T2, T3, T4) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
              <h2 className="text-lg font-extrabold text-[#172033] tracking-tight">
                Kedudukan Terkini Homeroom (Tingkatan 1 – 4)
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pungutan merit kumulatif bagi semua aktiviti dan pertandingan semester 2. Tingkatan 5 tidak dipertandingkan.
            </p>
          </div>
          <Link href="/ranking">
            <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
              <span>Lihat Analisis Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* 4-column responsive grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { form: 1, title: 'Tingkatan 1', rankings: rankingsT1 },
            { form: 2, title: 'Tingkatan 2', rankings: rankingsT2 },
            { form: 3, title: 'Tingkatan 3', rankings: rankingsT3 },
            { form: 4, title: 'Tingkatan 4', rankings: rankingsT4 },
          ].map((col) => (
            <Card key={col.form} className="flex flex-col p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#1646A0] text-white flex items-center justify-center font-bold text-xs">
                    T{col.form}
                  </span>
                  <span className="font-bold text-sm text-[#172033]">{col.title}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {col.rankings.length} Homeroom
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-14 w-full rounded-xl" />
                  ))
                ) : col.rankings.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#94A3B8]">
                    Belum ada homeroom didaftarkan.
                  </div>
                ) : (
                  col.rankings.slice(0, 5).map((item) => {
                    const isGold = item.rank === 1 && item.total_merit > 0;
                    const isSilver = item.rank === 2 && item.total_merit > 0;
                    const isBronze = item.rank === 3 && item.total_merit > 0;

                    return (
                      <div
                        key={item.homeroom_id}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          isGold
                            ? 'bg-[#FEF9C3]/50 border-[#FDE047] shadow-xs'
                            : isSilver
                            ? 'bg-[#F8FAFC] border-[#CBD5E1]'
                            : isBronze
                            ? 'bg-[#FFF7ED] border-[#FDBA74]'
                            : 'bg-white border-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {/* Rank badge */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              isGold
                                ? 'bg-[#FBBF24] text-[#78350F]'
                                : isSilver
                                ? 'bg-[#E2E8F0] text-[#334155]'
                                : isBronze
                                ? 'bg-[#FDBA74] text-[#7C2D12]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {item.rank}
                          </div>

                          <div className="truncate">
                            <div className="text-xs font-bold text-[#172033] truncate">
                              {item.homeroom_name}
                            </div>
                            <div className="text-[10px] text-[#64748B] truncate">
                              {item.advisor_name}
                            </div>
                          </div>
                        </div>

                        {/* Merit Points */}
                        <div className="text-right shrink-0 pl-2">
                          <div className="text-xs font-black text-[#1646A0]">
                            {item.total_merit}{' '}
                            <span className="text-[9px] font-normal text-[#64748B]">M</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-[#F1F5F9] text-center">
                <Link
                  href={`/ranking?form=${col.form}`}
                  className="text-[11px] font-semibold text-[#1646A0] hover:underline"
                >
                  Lihat kedudukan penuh →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. ACTIVITY TIMELINE & RECENT HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Aktiviti Seterusnya / Jadual Terkini */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#1646A0]" />
              <h3 className="text-base font-bold text-[#172033]">
                Aktiviti Minggu Ini
              </h3>
            </div>
            <Link href="/jadual" className="text-xs font-semibold text-[#1646A0] hover:underline flex items-center gap-1">
              <span>Buka Jadual Penuh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))
            ) : nextActivities.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B]">
                Belum ada slot jadual didaftarkan.
              </div>
            ) : (
              nextActivities.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs hover:border-[#BFDBFE] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                        {formatMalayDate(slot.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#64748B] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#172033]">
                      {slot.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span>PIC: <strong className="text-[#172033] font-medium">{slot.pic?.name || 'Belum Ditetapkan'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {slot.targets?.map((t) => (
                      <span
                        key={t.form}
                        className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]"
                      >
                        T{t.form}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Keputusan Terkini & Laporan Ringkas */}
        <div className="space-y-6">
          {/* Keputusan Terkini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Keputusan Terkini
                </h3>
              </div>
              <Link href="/dokumentasi/pemenang" className="text-xs font-semibold text-[#1646A0] hover:underline">
                Semua
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))
              ) : recentResults.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  Belum ada keputusan pertandingan direkodkan.
                </div>
              ) : (
                recentResults.map((res) => {
                  const johan = res.entries?.find(e => e.placement === 1);
                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#172033]">
                          {res.competition?.name}
                        </span>
                        <Badge variant="royal" size="sm">
                          T{res.competition?.form}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#64748B] flex items-center justify-between pt-1">
                        <span>Johan:</span>
                        <span className="font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#FDE68A]">
                          {johan?.homeroom?.name || 'Homeroom'} (100 M)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Laporan Bergambar Terkini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Laporan Terkini
                </h3>
              </div>
              <Link href="/galeri" className="text-xs font-semibold text-[#1646A0] hover:underline">
                Galeri
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <Skeleton className="h-20 w-full rounded-2xl" />
              ) : recentReports.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  Belum ada laporan slot dihantar.
                </div>
              ) : (
                recentReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs space-y-1"
                  >
                    <div className="text-xs font-bold text-[#172033]">
                      {rep.schedule_slot?.title || 'Laporan Slot'}
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {rep.summary}
                    </p>
                    <div className="text-[10px] text-[#94A3B8] pt-1 flex items-center justify-between">
                      <span>{rep.images?.length || 0} keping gambar</span>
                      <span>Oleh {rep.uploaded_by?.name || 'Guru'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
