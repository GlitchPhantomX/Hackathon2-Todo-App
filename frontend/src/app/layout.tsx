import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo application with authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ❌ Removed useDashboard from here - server component can't use client hooks
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ErrorBoundary>
              <MotionWrapper type="fade" duration={0.3}>
                {children}
              </MotionWrapper>
            </ErrorBoundary>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
        {/* ❌ Removed ToastContainer from here */}
      </body>
    </html>
  );
}