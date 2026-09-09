'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeacherSession } from '@/types/database';
import { getTeacherBySalaryNo } from '@/lib/supabase/service';

interface AuthContextType {
  user: TeacherSession | null;
  loading: boolean;
  login: (salaryNo: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'mingguaktiviti_teacher_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TeacherSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Restore session from localStorage on client mount
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse saved session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (salaryNo: string): Promise<{ success: boolean; error?: string }> => {
    if (!salaryNo || !salaryNo.trim()) {
      return { success: false, error: 'Sila masukkan nombor gaji anda.' };
    }

    try {
      const teacher = await getTeacherBySalaryNo(salaryNo);
      if (!teacher) {
        return { success: false, error: 'Nombor gaji tidak ditemui.' };
      }

      const sessionData: TeacherSession = {
        id: teacher.id,
        name: teacher.name,
        salary_no: teacher.salary_no,
        role: teacher.role || 'Guru'
      };

      setUser(sessionData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setIsLoginModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Ralat semasa log masuk: ' + err.message };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
