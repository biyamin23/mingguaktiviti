'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Calendar, 
  Clock, 
  User, 
  X, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  LogIn
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/session/auth-context';
import { useToast } from '@/components/ui/toast';
import { getScheduleSlots, createReport, uploadReportImage } from '@/lib/supabase/service';
import { compressImageClientSide, CompressionResult } from '@/lib/image-compression/compress';
import { ScheduleSlot } from '@/types/database';
import { formatMalayDate, formatTimeRange, formatBytes } from '@/lib/utils';

interface ProcessedImage {
  id: string;
  originalFile: File;
  compressedResult: CompressionResult;
  caption: string;
}

export default function LaporanBergambarPage() {
  const { user, openLoginModal } = useAuth();
  const toast = useToast();

  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Form Fields
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  // Processing & Uploading States
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const data = await getScheduleSlots();
        setSlots(data);
        if (data.length > 0) {
          setSelectedSlotId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, []);

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  // Handle Multi-Image Selection & Mandatory Client-Side Compression
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    setIsCompressing(true);
    const fileList = Array.from(files);
    setCompressProgress({ current: 0, total: fileList.length });

    const newProcessed: ProcessedImage[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setCompressProgress({ current: i + 1, total: fileList.length });

      try {
        // Compress client-side (Max 1920px, Quality 0.78, WebP conversion)
        const result = await compressImageClientSide(file, {
          maxLongEdge: 1920,
          quality: 0.78,
          maxSourceSizeMB: 15
        });

        newProcessed.push({
          id: Math.random().toString(36).substring(2, 9),
          originalFile: file,
          compressedResult: result,
          caption: '',
        });
      } catch (err: any) {
        toast.error(`Gagal memampatkan ${file.name}: ${err.message}`);
      }
    }

    setProcessedImages(prev => [...prev, ...newProcessed]);
    setIsCompressing(false);
    // Reset file input value so same files can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setProcessedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setProcessedImages(prev => prev.map(img => img.id === id ? { ...img, caption } : img));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      openLoginModal();
      return;
    }

    if (!selectedSlot) {
      setFormError('Sila pilih slot jadual aktiviti.');
      return;
    }

    if (!summary.trim()) {
      setFormError('Sila masukkan ringkasan aktiviti.');
      return;
    }

    if (processedImages.length === 0) {
      setFormError('Sila pilih sekurang-kurangnya satu gambar aktiviti.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: processedImages.length });

    try {
      const reportTempId = 'rep-' + Date.now();
      const uploadedImagesMeta: any[] = [];

      for (let i = 0; i < processedImages.length; i++) {
        const item = processedImages[i];
        setUploadProgress({ current: i + 1, total: processedImages.length });

        const uploadRes = await uploadReportImage(item.compressedResult.blob, reportTempId);
        if (uploadRes.error) {
          throw new Error(`Gagal memuat naik gambar ${i + 1}: ${uploadRes.error}`);
        }

        uploadedImagesMeta.push({
          storage_path: uploadRes.path,
          public_url: uploadRes.publicUrl,
          caption: item.caption.trim() || undefined,
          file_size: item.compressedResult.compressedSize,
          original_file_size: item.compressedResult.originalSize,
          width: item.compressedResult.width,
          height: item.compressedResult.height,
          mime_type: item.compressedResult.mimeType,
        });
      }

      // Save report record
      const res = await createReport({
        schedule_slot_id: selectedSlot.id,
        uploaded_by_teacher_id: user.id,
        summary: summary.trim(),
        images: uploadedImagesMeta
      });

      setIsSubmitting(false);

      if (res.error) {
        setFormError(res.error);
        toast.error(res.error);
      } else {
        toast.success('Laporan bergambar berjaya dihantar ke sistem!');
        // Reset form
        setSummary('');
        setProcessedImages([]);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Ralat semasa memuat naik laporan.');
      toast.error(err.message || 'Gagal memuat naik laporan.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
              <Camera className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#172033] tracking-tight">
              Hantar Laporan Bergambar Slot Aktiviti
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Muat naik foto aktiviti dengan mampatan automatik WebP berkualiti tinggi dan penyimpanan terus ke Supabase Storage.
          </p>
        </div>

        {!user && (
          <Button variant="primary" size="sm" onClick={openLoginModal}>
            <LogIn className="w-4 h-4 mr-1.5" />
            Log Masuk Guru Pelapor
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Slot Selector & Canonical Metadata Display */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Pilih Slot Aktiviti</CardTitle>
                <p className="text-xs text-[#64748B]">
                  Pilih slot daripada jadual rasmi. Metadata akan dimuatkan secara automatik.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSlots ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Pilih Slot Jadual <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {slots.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({formatMalayDate(s.date)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Auto-filled Canonical Metadata */}
                {selectedSlot && (
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5 text-xs">
                    <div className="font-bold text-sm text-[#172033] pb-1 border-b border-[#E2E8F0]">
                      {selectedSlot.title}
                    </div>

                    <div className="flex items-center gap-2 text-[#475569]">
                      <Calendar className="w-3.5 h-3.5 text-[#1646A0]" />
                      <span>{formatMalayDate(selectedSlot.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#475569]">
                      <Clock className="w-3.5 h-3.5 text-[#1646A0]" />
                      <span>{formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#475569]">
                      <User className="w-3.5 h-3.5 text-[#1646A0]" />
                      <span>PIC: <strong className="text-[#172033]">{selectedSlot.pic?.name || 'Belum Ditetapkan'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[#64748B]">Sasaran:</span>
                      {selectedSlot.targets?.map(t => (
                        <span key={t.form} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                          T{t.form}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compression Policy Card */}
            <Card className="bg-[#F0FDF4] border-[#BBF7D0] p-4 text-xs space-y-1.5 text-[#15803D]">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                <span>Mampatan Imej Automatik Diaktifkan</span>
              </div>
              <p className="text-[11px] text-[#166534] leading-relaxed">
                Setiap foto diproses secara terus di dalam pelayar anda: saiz maksima 1920px, format WebP (kualiti 0.78), dan pengurangan saiz fail sehingga 80% sebelum dimuat naik.
              </p>
            </Card>
          </div>

          {/* Right 2 Columns: Summary & Multiple Photos with Compression Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Butiran & Foto Laporan</CardTitle>
                <p className="text-xs text-[#64748B]">
                  Masukkan ringkasan aktiviti dan muat naik gambar dokumentasi slot.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Ringkasan Aktiviti */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Ringkasan Aktiviti <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Contoh: Aktiviti berjalan dengan lancar bermula jam 8:00 pagi di Dewan Besar. Semua murid Tingkatan 1 menunjukkan kerjasama yang amat padu..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] leading-relaxed"
                  />
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Pilih Foto Aktiviti (Boleh pilih beberapa keping sekaligus)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF]/30 transition-all cursor-pointer group">
                    <UploadCloud className="w-8 h-8 text-[#94A3B8] group-hover:text-[#2563EB] mb-2 transition-colors" />
                    <span className="text-xs font-bold text-[#172033]">
                      Klik untuk memilih fail foto (JPG, PNG, WebP)
                    </span>
                    <span className="text-[11px] text-[#64748B] mt-1">
                      Maksimum 15 MB per foto. Foto akan dimampatkan secara automatik ke WebP.
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelection}
                      disabled={isCompressing || isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Compression Progress Indicator */}
                {isCompressing && (
                  <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-1.5 text-[#1646A0]">
                    <div className="flex items-center justify-between font-bold">
                      <span>Memampatkan gambar {compressProgress.current} daripada {compressProgress.total}...</span>
                      <span>{Math.round((compressProgress.current / compressProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#BFDBFE] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full transition-all duration-200"
                        style={{ width: `${(compressProgress.current / compressProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Progress Indicator */}
                {isSubmitting && (
                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs space-y-1.5 text-[#15803D]">
                    <div className="flex items-center justify-between font-bold">
                      <span>Memuat naik gambar {uploadProgress.current} daripada {uploadProgress.total}...</span>
                      <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#BBF7D0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#16A34A] h-full transition-all duration-200"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Processed Images Preview Grid */}
                {processedImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#172033]">
                        {processedImages.length} Foto Bersedia Dimuat Naik
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Format: WebP (Resolusi dimampatkan)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {processedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-2 relative group"
                        >
                          <div className="relative h-40 w-full rounded-lg overflow-hidden bg-[#F1F5F9]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.compressedResult.previewUrl}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-[#DC2626] text-white transition-colors"
                              title="Buang Foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Compression Stats Badge */}
                          <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                            <span>Asal: {formatBytes(img.compressedResult.originalSize)}</span>
                            <span className="text-[#16A34A] font-bold">
                              Hasil: {formatBytes(img.compressedResult.compressedSize)} (-{img.compressedResult.savedPercent}%)
                            </span>
                          </div>

                          {/* Caption Input */}
                          <input
                            type="text"
                            placeholder="Kapsyen foto (pilihan)..."
                            value={img.caption}
                            onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting || isCompressing}
                    disabled={!user || processedImages.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <span>Hantar Laporan Bergambar</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
