import React from 'react';
import { ArrowLeft, Bell, ChevronDown } from 'lucide-react';

type TopBarProps = {
  title?: string;
};

export default function TopBar({ title = 'Dashboard' }: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md bg-white border border-gray-100">
          <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
        </button>
        <div className="text-sm font-semibold">{title}</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 rounded-md bg-white border border-gray-100">
            <Bell className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">J</div>
          <div className="text-sm">John Doe</div>
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </div>
      </div>
    </div>
  );
}
