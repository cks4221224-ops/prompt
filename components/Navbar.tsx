'use client';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[#1E1E2E] bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/prompt/list" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#C084FC] flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-white">PromptHub</span>
        </Link>

        <Link
          href="/prompt/new"
          className="px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#9B7DFF] text-white text-sm font-semibold transition-colors shadow-lg shadow-purple-900/30"
        >
          + 프롬프트 등록
        </Link>
      </div>
    </nav>
  );
}
