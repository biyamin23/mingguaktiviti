'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  loginAdmin: (password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'mingguaktiviti_admin_auth_status';
const MASTER_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'super@MRSM2026';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved === 'authenticated') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Error reading admin session', e);
    } finally {
      setMounted(true);
    }
  }, []);

  const loginAdmin = (password: string): { success: boolean; error?: string } => {
    if (!password) {
      return { success: false, error: 'Sila masukkan kata laluan admin.' };
    }

    if (password === MASTER_ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
        localStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    return { success: false, error: 'Kata laluan admin tidak tepat. Akses ditolak.' };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {mounted ? children : null}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
