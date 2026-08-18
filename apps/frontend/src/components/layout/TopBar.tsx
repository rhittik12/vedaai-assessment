"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Plus } from 'lucide-react';

const labels: Record<string, string> = { '/overview': 'Overview', '/assignments': 'Assignments', '/assignments/create': 'New assignment' };
export default function TopBar() {
  const pathname = usePathname(); const router = useRouter();
  const title = labels[pathname] ?? (pathname.includes('/result') ? 'Generated paper' : pathname.includes('/generating') ? 'Generating paper' : pathname.startsWith('/assignments/') ? 'Assignment details' : 'VedaAI');
  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e7eaf0] bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="grid h-8 w-8 place-items-center rounded-lg bg-[#172033] text-xs font-black text-white lg:hidden">V</Link>{pathname !== '/' ? <button onClick={() => router.back()} className="hidden h-8 w-8 place-items-center rounded-lg text-[#667085] hover:bg-[#f3f4f6] sm:grid" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button> : null}<span className="truncate text-sm font-semibold text-[#344054]">{title}</span></div><div className="flex items-center gap-2"><Link href="/assignments/create" className="btn-primary hidden px-3 py-2 sm:inline-flex"><Plus className="h-4 w-4" /><span className="hidden md:inline">Create</span></Link><button className="relative grid h-9 w-9 place-items-center rounded-xl text-[#667085] transition hover:bg-[#f3f4f6]" aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e96025]" /></button><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e6eaf0] text-xs font-bold text-[#475467]">JD</span></div></header>;
}
