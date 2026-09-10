'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/session/auth-context';
import { useToast } from '@/components/ui/toast';
import { LogIn, KeyRound, AlertCircle } from 'lucide-react';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [salaryNo, setSalaryNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(salaryNo);
    setLoading(false);

    if (res.success) {
      toast.success('Log masuk berjaya.');
      setSalaryNo('');
    } else {
      setErrorMsg(res.error || 'Nombor gaji tidak ditemui.');
    }
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => {
        closeLoginModal();
        setErrorMsg('');
      }}
      title="Login"
      description="Sila masukkan Nombor Gaji anda untuk mengakses modul keputusan & laporan."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5">
            Nombor Gaji Guru
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoFocus
              value={salaryNo}
              onChange={(e) => {
                setSalaryNo(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Contoh: 310000"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] uppercase font-mono tracking-wider"
            />
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Identiti disahkan melalui senarai rekod rasmi Master Guru.
          </p>
        </div>

        {/* Quick Demo Credentials */}


        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeLoginModal}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            Log Masuk
          </Button>
        </div>
      </form>
    </Modal>
  );
}
