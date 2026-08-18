"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, FileText, Home, Plus, Settings, Sparkles, Users, ExternalLink, X } from 'lucide-react';

const navItems = [
  { label: 'Overview', Icon: Home, href: '/overview' },
  { label: 'Assignments', Icon: FileText, href: '/assignments' },
  { label: 'My groups', Icon: Users, href: '/groups' },
  { label: 'Teacher toolkit', Icon: Sparkles, href: '/toolkit' },
  { label: 'Resource library', Icon: BookOpen, href: '/library' }
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    onClose();
    if (href === '/assignments/create') {
      router.push(href);
    }
  };

  return (
    <>
      {open ? <button type="button" aria-label="Close navigation menu" onClick={onClose} className="fixed inset-0 z-30 bg-[#172033]/40 lg:hidden" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[272px] shrink-0 flex-col border-r border-[#e7eaf0] bg-white px-4 py-5 transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:translate-x-0 lg:top-0 lg:z-30 lg:flex`}>
        <div className="flex items-center justify-between gap-3 px-2 lg:block">
          <Link href="/overview" className="flex items-center gap-3" aria-label="VedaAI home" onClick={onClose}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#172033] text-sm font-black text-white shadow-sm">V</span>
            <span>
              <span className="block text-lg font-bold tracking-[-0.04em] text-[#172033]">VedaAI</span>
              <span className="block text-[11px] font-medium text-[#98a2b3]">TEACHING WORKSPACE</span>
            </span>
          </Link>

          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-[#667085] hover:bg-[#f3f4f6] lg:hidden" aria-label="Close menu">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <button type="button" onClick={() => handleNavigate('/assignments/create')} className="btn-accent mt-8 w-full">
          <Plus className="h-4 w-4" />
          Create assignment
        </button>

        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#98a2b3]">Workspace</p>
          {navItems.map(({ label, Icon, href }) => {
            const active = href === '/overview' ? pathname === '/overview' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-[#fff0ea] text-[#bd4312]' : 'text-[#667085] hover:bg-[#f7f8fa] hover:text-[#344054]'}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-2">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#667085] transition hover:bg-[#f7f8fa]" onClick={onClose}>
            <ExternalLink className="h-[18px] w-[18px]" />
            About VedaAI
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#667085] transition hover:bg-[#f7f8fa]" onClick={onClose}>
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
          <div className="rounded-xl border border-[#edf0f4] bg-[#fbfcfd] p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f3f6] text-xs font-bold text-[#475467]">DS</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-[#344054]">Delhi Public School</span>
                <span className="block truncate text-[11px] text-[#98a2b3]">Bokaro Steel City</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
