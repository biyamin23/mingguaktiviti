'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Printer, 
  Search, 
  Eye, 
  FileText, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getReports, getReportImageUrl } from '@/lib/supabase/service';
import { Report } from '@/types/database';
import { formatMalayDate, formatTimeRange } from '@/lib/utils';

export default function DokumentasiLaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterForm, setFilterForm] = useState('all');

  // Selected Report for Full A4 Preview Modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getReports();
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueDates = Array.from(new Set(reports.map(r => r.schedule_slot?.date).filter(Boolean))) as string[];

  const filteredReports = reports.filter(r => {
    const matchSearch = (r.schedule_slot?.title && r.schedule_slot.title.toLowerCase().includes(search.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(search.toLowerCase())) ||
      (r.uploaded_by?.name && r.uploaded_by.name.toLowerCase().includes(search.toLowerCase()));

    const matchDate = filterDate === 'all' || r.schedule_slot?.date === filterDate;
    const matchForm = filterForm === 'all' || r.schedule_slot?.targets?.some(t => t.form === Number(filterForm));

    return matchSearch && matchDate && matchForm;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Dokumentasi Laporan Slot Aktiviti
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Senarai laporan rasmi berserta format cetakan A4 lengkap dengan gambar dan ringkasan aktiviti.
          </p>
        </div>

        <div className="text-xs font-bold text-[#1646A0] bg-[#EFF6FF] px-3.5 py-1.5 rounded-xl border border-[#BFDBFE]">
          {filteredReports.length} Laporan Dihantar
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aktiviti, ringkasan, atau pelapor..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

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

          <div>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Semua Tingkatan</option>
              <option value="1">Tingkatan 1</option>
              <option value="2">Tingkatan 2</option>
              <option value="3">Tingkatan 3</option>
              <option value="4">Tingkatan 4</option>
              <option value="5">Tingkatan 5</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Report Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada laporan dihantar."
          description="Laporan yang dihantar melalui modul Laporan Bergambar akan dipaparkan di sini."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                    {report.schedule_slot?.date ? formatMalayDate(report.schedule_slot.date) : '13 Sept 2026'}
                  </span>
                  <div className="flex items-center gap-1">
                    {report.schedule_slot?.targets?.map(t => (
                      <span key={t.form} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]">
                        T{t.form}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#172033] mb-2">
                  {report.schedule_slot?.title || 'Slot Aktiviti'}
                </h3>

                <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed mb-4">
                  {report.summary}
                </p>

                {/* Thumbnails preview */}
                {report.images && report.images.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
                    {report.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="w-16 h-12 rounded-lg bg-[#F1F5F9] overflow-hidden shrink-0 border border-[#E2E8F0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getReportImageUrl(img)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {report.images.length > 4 && (
                      <div className="w-16 h-12 rounded-lg bg-[#EFF6FF] text-[#1646A0] font-bold text-xs flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                        +{report.images.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-3 border-t border-[#F1F5F9]">
                  <span>PIC: <strong>{report.schedule_slot?.pic?.name || 'Guru'}</strong></span>
                  <span>Pelapor: <strong>{report.uploaded_by?.name || 'Guru'}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  className="gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat & Cetak Dokumen A4</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* A4 Report Modal & Print View */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-10 my-8 a4-print-page">
            {/* Top Toolbar (Hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E8F0] no-print">
              <div className="text-xs font-bold text-[#1646A0]">
                Pratonton Format Rasmi A4
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5">
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </Button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official MRSM Header */}
            <div className="border-b-2 border-[#1646A0] pb-6 mb-6">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo-mrsm.png" 
                  alt="Logo Maktab Rendah Sains MARA" 
                  className="w-16 h-16 object-contain shrink-0 filter drop-shadow-xs" 
                />
                <div>
                  <div className="text-xs font-bold tracking-widest text-[#1646A0] uppercase">
                    Maktab Rendah Sains MARA Tumpat
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                    LAPORAN DOKUMENTASI AKTIVITI
                  </h1>
                  <div className="text-xs text-[#64748B]">
                    Minggu Aktiviti Semester 2 • 13–15 September 2026
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] p-4 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[#64748B] block">Slot / Aktiviti:</span>
                <strong className="text-[#172033] text-sm">{selectedReport.schedule_slot?.title}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Tarikh & Masa:</span>
                <strong className="text-[#172033]">
                  {selectedReport.schedule_slot?.date && formatMalayDate(selectedReport.schedule_slot.date)}
                  <br />
                  {selectedReport.schedule_slot && formatTimeRange(selectedReport.schedule_slot.start_time, selectedReport.schedule_slot.end_time)}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Sasaran Tingkatan:</span>
                <div className="flex gap-1 mt-0.5">
                  {selectedReport.schedule_slot?.targets?.map(t => (
                    <span key={t.form} className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                      T{t.form}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#64748B] block">Penyelaras & Pelapor:</span>
                <strong className="text-[#172033]">
                  PIC: {selectedReport.schedule_slot?.pic?.name || '—'}
                  <br />
                  Oleh: {selectedReport.uploaded_by?.name || '—'}
                </strong>
              </div>
            </div>

            {/* Ringkasan Aktiviti */}
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-bold text-[#172033] border-b pb-1">
                Ringkasan Aktiviti
              </h3>
              <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                {selectedReport.summary}
              </p>
            </div>

            {/* Photo Grid with Captions */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-bold text-[#172033] border-b pb-1">
                Dokumentasi Foto Aktiviti
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {selectedReport.images?.map((img, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-xl p-2 bg-white space-y-1.5">
                    <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-[#F1F5F9] relative flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getReportImageUrl(img)}
                        alt={img.caption || `Foto ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {img.caption && (
                      <p className="text-[11px] text-[#475569] italic text-center">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 border-t border-[#CBD5E1] grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-[#64748B]">Disediakan Oleh:</p>
                <div className="h-16" />
                <p className="font-bold border-t border-[#CBD5E1] pt-1">
                  {selectedReport.uploaded_by?.name || 'Guru Pelapor'}
                </p>
              </div>
              <div>
                <p className="text-[#64748B]">Disahkan Oleh:</p>
                <div className="h-16" />
                <p className="font-bold border-t border-[#CBD5E1] pt-1">
                  Penyelaras Minggu Aktiviti
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
