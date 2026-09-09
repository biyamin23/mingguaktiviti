'use client';

import React, { useState, useEffect } from 'react';
import { 
  Images, 
  Eye, 
  X, 
  Download, 
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getReports } from '@/lib/supabase/service';
import { formatMalayDate } from '@/lib/utils';

interface GalleryItem {
  id: string;
  url: string;
  caption?: string | null;
  slotTitle: string;
  date: string;
  reporterName?: string;
}

export default function GaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      try {
        const reports = await getReports();
        const galleryList: GalleryItem[] = [];

        reports.forEach(report => {
          if (report.images) {
            report.images.forEach(img => {
              galleryList.push({
                id: img.id,
                url: img.public_url || img.storage_path,
                caption: img.caption,
                slotTitle: report.schedule_slot?.title || 'Aktiviti Minggu Ini',
                date: report.schedule_slot?.date || report.created_at || '2026-09-13',
                reporterName: report.uploaded_by?.name || 'Guru'
              });
            });
          }
        });

        setItems(galleryList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const uniqueDates = Array.from(new Set(items.map(i => i.date))).sort();

  const filteredItems = items.filter(item => {
    const matchSearch = item.slotTitle.toLowerCase().includes(search.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(search.toLowerCase()));
    const matchDate = filterDate === 'all' || item.date === filterDate;
    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EFF6FF] text-[#1646A0]">
              <Images className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Galeri Foto Minggu Aktiviti
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Koleksi foto berkualiti tinggi daripada semua slot aktiviti murid sepanjang 13–15 September 2026.
          </p>
        </div>

        <div className="text-xs font-bold text-[#1646A0] bg-[#EFF6FF] px-3.5 py-1.5 rounded-xl border border-[#BFDBFE]">
          {filteredItems.length} Keping Foto
        </div>
      </div>

      {/* Search & Date Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kapsyen atau aktiviti..."
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
        </div>
      </Card>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Belum ada gambar untuk dipaparkan."
          description="Foto aktiviti yang dimuat naik melalui Laporan Bergambar akan dipaparkan secara automatik di sini."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-4/3 w-full bg-[#F1F5F9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.caption || item.slotTitle}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Penuh
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#172033] line-clamp-1 mb-1">
                    {item.slotTitle}
                  </div>
                  {item.caption && (
                    <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-2 mt-2 border-t border-[#F8FAFC]">
                  <span>{formatMalayDate(item.date)}</span>
                  <span>{item.reporterName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black max-h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.url}
                alt={selectedItem.caption || selectedItem.slotTitle}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  {selectedItem.slotTitle}
                </h3>
                {selectedItem.caption && (
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedItem.caption}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] mt-1.5">
                  <span>{formatMalayDate(selectedItem.date)}</span>
                  <span>•</span>
                  <span>Oleh {selectedItem.reporterName}</span>
                </div>
              </div>

              <a
                href={selectedItem.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1646A0] text-white hover:bg-[#0B2F6B] transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Muat Turun Foto</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
