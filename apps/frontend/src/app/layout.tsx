import type { Metadata } from 'next';
import './globals.css';
import AppChrome from '../components/layout/AppChrome';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { title: 'VedaAI | Teaching workspace', description: 'Create thoughtful assessments with VedaAI.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-[#f7f8fa] text-[#172033]'}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
