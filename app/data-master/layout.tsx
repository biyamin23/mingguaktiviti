'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { useAdmin } from '@/lib/session/admin-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DataMasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginAdmin(password);
      if (!res.success) {
        setError(res.error || 'Kata laluan tidak sah.');
      } else {
        setPassword('');
      }
      setLoading(false);
    }, 250);
  };

  // If admin is NOT authenticated, show the secure lock screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="p-8 border-2 border-[#CBD5E1] shadow-2xl bg-white rounded-2xl relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B2F6B] via-[#2563EB] to-[#FBBF24]" />

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1646A0] flex items-center justify-center mb-4 shadow-inner">
                <Lock className="w-8 h-8 text-[#1646A0]" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                Kawasan Pentadbir Sahaja
              </span>
              <h1 className="text-xl font-black text-[#0B2F6B]">
                Data Master Dikunci
              </h1>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Sila masukkan kata laluan keselamatan untuk mengakses dan menguruskan rekod rasmi MRSM Tumpat.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5">
                  Kata Laluan Pentadbir (Admin Password)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata laluan pentadbir..."
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1"
                    title={showPassword ? 'Sembunyi kata laluan' : 'Tunjuk kata laluan'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-2.5 font-bold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Buka Kunci Data Master
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#0B2F6B] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Dashboard Utama
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If admin is authenticated, show header bar and render children
  return (
    <div className="space-y-6">
      {/* Admin Status Top Bar */}
      <div className="bg-gradient-to-r from-[#0B2F6B] to-[#1646A0] rounded-2xl p-3.5 sm:px-6 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Mod Pentadbir Aktif
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                Unlocked
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              Anda kini mempunyai kebenaran penuh mengemaskini master guru, homeroom, pertandingan & merit.
            </p>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 hover:border-white/30 transition-all cursor-pointer"
          title="Kunci Semula Data Master"
        >
          <Lock className="w-3.5 h-3.5 text-[#FBBF24]" />
          Kunci Semula / Log Keluar Admin
        </button>
      </div>

      {children}
    </div>
  );
}
