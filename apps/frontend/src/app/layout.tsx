import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VedaAI',
  description: 'Frontend for the vedaai assessment monorepo'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-[#F5F5F5] text-[#1A1A1A]'}>
        <div className="flex">
          <Sidebar />
          <div className="ml-[280px] w-[calc(100%-280px)] min-h-screen">
            <TopBar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}