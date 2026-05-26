"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Users, FileText, Cpu, Book, Settings, Zap } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', Icon: Home, href: '/' },
  { id: 'groups', label: 'My Groups', Icon: Users, href: '/groups' },
  { id: 'assignments', label: 'Assignments', Icon: FileText, href: '/assignments' },
  { id: 'toolkit', label: "AI Teacher's Toolkit", Icon: Cpu, href: '/toolkit' },
  { id: 'library', label: 'My Library', Icon: Book, href: '/library' }
];

type SidebarProps = {
  active?: string;
  assignmentsCount?: number;
};

export default function Sidebar({ active = 'home', assignmentsCount = 0 }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="w-[280px] bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F26522] text-white font-bold rounded-sm flex items-center justify-center">V</div>
            <div className="text-xl font-bold text-[#1A1A1A]">VedaAI</div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/assignments/create')}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3 rounded-full text-sm font-semibold relative"
            style={{ boxShadow: '0 0 12px rgba(242,101,34,0.35)', border: '1px solid rgba(242,101,34,0.12)' }}
          >
            <span className="text-orange-400">✦</span>
            Create Assignment
          </button>
        </div>

        <nav className="mt-4 px-2">
          {navItems.map((item) => {
            const activeItem = item.id === active;
            return (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-md mx-2 ${activeItem ? 'bg-[#F3F4F6] font-semibold' : 'text-[#6B7280]'}`}>
                <item.Icon className={`w-5 h-5 ${activeItem ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`} />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.id === 'assignments' && assignmentsCount > 0 && (
                  <span className="ml-2 text-xs bg-[#F26522] text-white px-2 py-1 rounded-full">{assignmentsCount}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-6">
        <div className="border-t border-gray-100 pt-4">
          <Link href="/settings" className="flex items-center gap-3 px-2 py-2 text-sm text-[#6B7280] hover:text-[#1A1A1A]">
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          <div className="mt-4 bg-gray-50 p-3 rounded-md flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">DS</div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Delhi Public School</div>
              <div className="text-xs text-[#6B7280]">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
