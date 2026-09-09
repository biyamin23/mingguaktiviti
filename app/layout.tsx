import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/session/auth-context';
import { AdminProvider } from '@/lib/session/admin-context';
import { ToastProvider } from '@/components/ui/toast';
import { AppShell } from '@/components/layout/app-shell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portal Minggu Aktiviti Semester 2 — MRSM Tumpat 2026',
  description: 'Pusat Kawalan & Pengurusan Rasmi Minggu Aktiviti Semester 2 MRSM Tumpat 2026 (13–15 September 2026). Jadual aktiviti, keputusan pertandingan, ranking merit, dan dokumentasi bergambar.',
  keywords: ['MRSM Tumpat', 'Minggu Aktiviti', '2026', 'Semester 2', 'Merit', 'Homeroom'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={inter.className}>
      <body suppressHydrationWarning className="min-h-screen bg-[#F5F8FC] antialiased selection:bg-[#BFDBFE] selection:text-[#0B2F6B]">
        <AuthProvider>
          <AdminProvider>
            <ToastProvider>
              <AppShell>
                {children}
              </AppShell>
            </ToastProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
