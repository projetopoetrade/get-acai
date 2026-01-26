// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { UIProvider } from '@/contexts/ui-provider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GetAçaí - Açaí batido na hora',
  description: 'Peça açaí para entrega em Fortaleza',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            {children}
            <BottomNav />
            <Toaster position="top-center" />
          </UIProvider>
          
        </ThemeProvider>
      </body>
    </html>
  );
}
