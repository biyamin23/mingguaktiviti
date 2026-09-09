'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Trophy, 
  Medal, 
  FileText, 
  Camera, 
  Images, 
  Database, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  UserCircle, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  School,
  FileCheck2,
  FolderKanban,
  Users,
  Home,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/session/auth-context';
import { useAdmin } from '@/lib/session/admin-context';
import { LoginModal } from './login-modal';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, openLoginModal } = useAuth();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataMasterOpen, setDataMasterOpen] = useState(pathname.startsWith('/data-master'));
  const [dokOpen, setDokOpen] = useState(pathname.startsWith('/dokumentasi'));

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Jadual Aktiviti', href: '/jadual', icon: CalendarDays },
    { label: 'Keputusan Pertandingan', href: '/keputusan', icon: Trophy, requiresAuth: true },
    { label: 'Ranking Keseluruhan', href: '/ranking', icon: Medal },
    { 
      label: 'Dokumentasi', 
      icon: FileText,
      isOpen: dokOpen,
      setIsOpen: setDokOpen,
      subItems: [
        { label: 'Dokumentasi Pemenang', href: '/dokumentasi/pemenang', icon: FileCheck2 },
        { label: 'Dokumentasi Laporan Slot', href: '/dokumentasi/laporan', icon: FolderKanban },
      ]
    },
    { label: 'Laporan Bergambar', href: '/laporan-bergambar', icon: Camera, requiresAuth: true },
    { label: 'Galeri Foto', href: '/galeri', icon: Images },
    { 
      label: 'Data Master', 
      icon: Database,
      isOpen: dataMasterOpen,
      setIsOpen: setDataMasterOpen,
      subItems: [
        { label: 'Guru', href: '/data-master/guru', icon: Users },
        { label: 'Homeroom', href: '/data-master/homeroom', icon: Home },
        { label: 'Pertandingan', href: '/data-master/pertandingan', icon: Trophy },
        { label: 'Tetapan Merit', href: '/data-master/merit', icon: Sliders },
        { label: 'Import Data Master', href: '/data-master/import', icon: FileSpreadsheet },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#172033] flex flex-col">
      {/* Login Modal */}
      <LoginModal />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2F6B] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
                <School className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-[#0B2F6B]">
                    MRSM TUMPAT
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1646A0] border border-[#BFDBFE]">
                    2026
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] tracking-wide">
                  Portal Minggu Aktiviti Sem 2
                </span>
              </div>
            </Link>
          </div>

          {/* User Session / Login Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-[#F8FAFC] border border-[#E2E8F0] py-1.5 px-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#1646A0] text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#172033] line-clamp-1 max-w-[140px]">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                    <span className="font-mono font-semibold text-[#1646A0]">{user.salary_no}</span>
                    <span>•</span>
                    <span>{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Log Keluar"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={openLoginModal}
                className="shadow-xs"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                <span>Log Masuk Guru</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 no-print">
          <div className="sticky top-24 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Menu Utama
            </div>

            {navItems.map((item) => {
              if (item.subItems) {
                const isSubActive = item.subItems.some(sub => pathname === sub.href);
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => item.setIsOpen?.(!item.isOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                        isSubActive 
                          ? 'bg-[#EFF6FF] text-[#1646A0]' 
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#172033]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={cn('w-4 h-4', isSubActive ? 'text-[#1646A0]' : 'text-[#64748B]')} />
                        <span>{item.label}</span>
                        {item.label === 'Data Master' && (
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                            isAdmin 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          )}>
                            {isAdmin ? 'Admin' : 'Kunci'}
                          </span>
                        )}
                      </div>
                      {item.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {item.isOpen && (
                      <div className="pl-6 space-y-1 border-l-2 border-[#E2E8F0] ml-4 my-1">
                        {item.subItems.map((sub) => {
                          const isActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                isActive 
                                  ? 'bg-[#1646A0] text-white shadow-xs font-semibold' 
                                  : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
                              )}
                            >
                              <sub.icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                    isActive 
                      ? 'bg-[#1646A0] text-white shadow-xs' 
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#172033]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-[#64748B]')} />
                    <span>{item.label}</span>
                  </div>
                  {item.requiresAuth && !user && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E]">
                      Kunci
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Status / School Info Box */}
            <div className="pt-6 px-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2F6B]/5 to-[#2563EB]/10 border border-[#BFDBFE]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B2F6B] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>Status Minggu Aktiviti</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed mb-3">
                  13–15 September 2026. Semua markah merit dan slot dikemaskini secara langsung.
                </p>
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#1646A0]">
                  <span>Pusat Kawalan MRSM</span>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B2F6B] text-white flex items-center justify-center font-black text-xs">
                    MT
                  </div>
                  <span className="font-bold text-sm text-[#0B2F6B]">Menu Portal</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 flex-1">
                {navItems.map((item) => {
                  if (item.subItems) {
                    return (
                      <div key={item.label} className="space-y-1 py-1">
                        <div className="px-3 py-1 text-xs font-bold text-[#94A3B8] uppercase flex items-center justify-between">
                          <span>{item.label}</span>
                          {item.label === 'Data Master' && (
                            <span className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded border normal-case',
                              isAdmin 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            )}>
                              {isAdmin ? 'Admin' : 'Kunci'}
                            </span>
                          )}
                        </div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold',
                              pathname === sub.href
                                ? 'bg-[#1646A0] text-white'
                                : 'text-[#475569] hover:bg-[#F1F5F9]'
                            )}
                          >
                            <sub.icon className="w-4 h-4" />
                            <span>{sub.label}</span>
                          </Link>
                        ))}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold',
                        isActive
                          ? 'bg-[#1646A0] text-white'
                          : 'text-[#475569] hover:bg-[#F1F5F9]'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Footer with Session Info */}
              <div className="pt-4 border-t border-[#F1F5F9]">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <UserCircle className="w-6 h-6 text-[#1646A0]" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#172033] truncate">{user.name}</div>
                        <div className="text-[10px] text-[#64748B]">{user.salary_no} • {user.role}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-[#DC2626]"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      Log Keluar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Log Masuk Guru
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] bg-white py-6 no-print text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Maktab Rendah Sains MARA Tumpat. Hak Cipta Terpelihara.</p>
          <p className="flex items-center gap-1.5">
            <span>Pusat Kawalan Minggu Aktiviti Semester 2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          </p>
        </div>
      </footer>
    </div>
  );
}
