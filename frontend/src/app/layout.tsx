// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';
import ToastContainer from '@/components/ToastContainer';
import WebSocketNotificationListener from '@/components/WebSocketNotificationListener';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo application with authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <WebSocketNotificationListener />  {/* ✅ ADD THIS LINE */}
          {children}
          {/* Toast Container - Shows notifications */}
          <ToastContainer />
        </ClientProviders>
      </body>
    </html>
  );
}