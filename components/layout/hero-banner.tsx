import React from 'react';
import { Calendar, Sparkles, Trophy, Flag } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2F6B] via-[#1646A0] to-[#2563EB] text-white p-8 md:p-12 shadow-xl border border-white/10 mb-8">
      {/* Subtle decorative background circles */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-[#38BDF8]/10 blur-xl pointer-events-none" />
      <div className="absolute left-10 top-1/2 w-40 h-40 rounded-full bg-[#FBBF24]/5 blur-lg pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Date pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-white mb-6 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>13–15 September 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          <span className="text-white/80 font-normal">MRSM Tumpat</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-white mb-4">
          Minggu Aktiviti, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FDE68A]">
            lebih meriah & tersusun.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-blue-100/90 font-medium max-w-xl leading-relaxed mb-8">
          Portal Minggu Aktiviti Semester 2 MRSM Tumpat 2026
        </p>

        {/* Quick event highlights pill bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FBBF24]" />
            <span>Pemberian Merit Automatik</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            <span>Laporan & Mampatan Gambar Pintar</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#4ADE80]" />
            <span>Pusat Kawalan Jadual Terpusat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
