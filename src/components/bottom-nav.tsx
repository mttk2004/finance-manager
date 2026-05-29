'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 w-full left-0 bg-neutral-900/80 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-16 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-16 md:justify-center md:gap-12 md:bg-neutral-900/60">
      <Link href="/" className={cn("flex flex-col md:flex-row md:px-4 items-center justify-center h-full space-y-1 md:space-y-0 md:space-x-3 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer", pathname === '/' && "text-emerald-500 hover:text-emerald-400 md:text-emerald-400")}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider cursor-pointer">TRANG CHỦ</span>
      </Link>
      <Link href="/charts" className={cn("flex flex-col md:flex-row md:px-4 items-center justify-center h-full space-y-1 md:space-y-0 md:space-x-3 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer", pathname === '/charts' && "text-emerald-500 hover:text-emerald-400 md:text-emerald-400")}>
        <BarChart2 className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider cursor-pointer">BIỂU ĐỒ</span>
      </Link>
      <Link href="/settings" className={cn("flex flex-col md:flex-row md:px-4 items-center justify-center h-full space-y-1 md:space-y-0 md:space-x-3 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer", pathname === '/settings' && "text-emerald-500 hover:text-emerald-400 md:text-emerald-400")}>
        <Settings className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-medium tracking-wider cursor-pointer">CÀI ĐẶT</span>
      </Link>
    </nav>
  );
}
