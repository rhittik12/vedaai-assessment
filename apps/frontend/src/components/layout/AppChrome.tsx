"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/welcome') return <>{children}</>;
  return <div className="min-h-screen lg:flex"><Sidebar /><div className="min-w-0 flex-1 lg:ml-[272px]"><TopBar /><main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div></div>;
}
