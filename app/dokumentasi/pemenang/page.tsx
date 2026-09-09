'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getResults } from '@/lib/supabase/service';
import { Result } from '@/types/database';

export default function DokumentasiPemenangPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterForm, setFilterForm] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getResults();
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredResults = results.filter(r => {
    if (filterForm === 'all') return true;
    return r.competition?.form === Number(filterForm);
  });

  const handlePrint = () => {
    window.print();
  };

  const getWinnerName = (result: Result, place: number) => {
    const entry = result.entries?.find(e => e.placement === place);
    return entry?.homeroom?.name || '—';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action / Header Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Dokumentasi Pemenang Pertandingan
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Senarai rasmi pemenang tempat 1 hingga 5 bagi semua pertandingan Minggu Aktiviti Semester 2.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Form Filter Pills */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            {['all', '1', '2', '3', '4'].map(f => (
              <button
                key={f}
                onClick={() => setFilterForm(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterForm === f ? 'bg-white text-[#1646A0] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                {f === 'all' ? 'Semua' : `T${f}`}
              </button>
            ))}
          </div>

          <Button variant="primary" size="md" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            <span>Cetak A4 Landskap</span>
          </Button>
        </div>
      </div>

      {/* Official A4 Document Layout (Printable) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-10 shadow-xs a4-print-page">
        {/* Printable Official Header */}
        <div className="border-b-2 border-[#1646A0] pb-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B2F6B] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                MRSM
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider text-[#1646A0] uppercase">
                  Maktab Rendah Sains MARA Tumpat
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                  SENARAI PEMENANG MINGGU AKTIVITI SEMESTER 2
                </h2>
                <div className="text-xs text-[#64748B] mt-0.5">
                  Tarikh Acara: 13–15 September 2026 • Dokumen Rasmi Pusat Kawalan
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Terkini & Disahkan
              </span>
            </div>
          </div>
        </div>

        {/* Winners Table */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Belum ada keputusan direkodkan."
            description="Keputusan yang disahkan akan dipaparkan secara automatik di dalam format dokumentasi ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-y border-[#CBD5E1] text-[#172033] font-bold">
                  <th className="py-3 px-3 w-10 text-center">Bil</th>
                  <th className="py-3 px-3">Pertandingan</th>
                  <th className="py-3 px-2 text-center">Tingkatan</th>
                  <th className="py-3 px-3 bg-[#FEF9C3]/70 text-[#854D0E]">Johan (100M)</th>
                  <th className="py-3 px-3 bg-[#F1F5F9] text-[#334155]">Naib Johan (70M)</th>
                  <th className="py-3 px-3 bg-[#FFEDD5]/60 text-[#9A3412]">Ketiga (40M)</th>
                  <th className="py-3 px-3 text-[#1E40AF]">Keempat (30M)</th>
                  <th className="py-3 px-3 text-[#1E40AF]">Kelima (20M)</th>
                  <th className="py-3 px-3 text-[#64748B]">Guru Pelapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredResults.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3 text-center font-bold text-[#64748B]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#172033]">
                      {r.competition?.name}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                        T{r.competition?.form}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#854D0E] bg-[#FEF9C3]/40">
                      {getWinnerName(r, 1)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#334155] bg-[#F8FAFC]">
                      {getWinnerName(r, 2)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#9A3412] bg-[#FFEDD5]/30">
                      {getWinnerName(r, 3)}
                    </td>
                    <td className="py-3 px-3 text-[#1E40AF]">
                      {getWinnerName(r, 4)}
                    </td>
                    <td className="py-3 px-3 text-[#1E40AF]">
                      {getWinnerName(r, 5)}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#64748B]">
                      {r.entered_by?.name || 'Penyelaras'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Printable Footer Signatures */}
        <div className="hidden print-only pt-12 mt-8 border-t border-[#E2E8F0] grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <p className="font-semibold text-[#172033]">Disediakan Oleh:</p>
            <div className="h-16" />
            <p className="font-bold border-t border-[#CBD5E1] pt-1">Penyelaras Minggu Aktiviti</p>
          </div>
          <div>
            <p className="font-semibold text-[#172033]">Disemak Oleh:</p>
            <div className="h-16" />
            <p className="font-bold border-t border-[#CBD5E1] pt-1">Ketua Bidang / Penolong Kanan</p>
          </div>
          <div>
            <p className="font-semibold text-[#172033]">Disahkan Oleh:</p>
            <div className="h-16" />
            <p className="font-bold border-t border-[#CBD5E1] pt-1">Pengetua MRSM Tumpat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
