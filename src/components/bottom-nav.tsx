'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 w-full left-0 bg-neutral-900/80 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-16 z-50 md:sticky md:top-0 md:w-64 md:h-screen md:flex-col md:justify-start md:border-t-0 md:border-r md:pt-8 md:gap-4 md:bg-[#0a0a0a]">
      <Link href="/" className={cn("flex flex-col md:flex-row md:w-full md:px-6 items-center md:justify-start justify-center w-full h-full md:h-12 space-y-1 md:space-y-0 md:space-x-4 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/' && "text-emerald-500 hover:text-emerald-400 md:bg-white/5 md:text-emerald-500")}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider">HOME</span>
      </Link>
      <Link href="/charts" className={cn("flex flex-col md:flex-row md:w-full md:px-6 items-center md:justify-start justify-center w-full h-full md:h-12 space-y-1 md:space-y-0 md:space-x-4 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/charts' && "text-emerald-500 hover:text-emerald-400 md:bg-white/5 md:text-emerald-500")}>
        <BarChart2 className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider">CHARTS</span>
      </Link>
      <Link href="/settings" className={cn("flex flex-col md:flex-row md:w-full md:px-6 items-center md:justify-start justify-center w-full h-full md:h-12 space-y-1 md:space-y-0 md:space-x-4 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/settings' && "text-emerald-500 hover:text-emerald-400 md:bg-white/5 md:text-emerald-500")}>
        <Settings className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider">SETTINGS</span>
      </Link>
    </nav>
  );
}
