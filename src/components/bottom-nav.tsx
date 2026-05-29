'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-neutral-900/80 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-16 z-50">
      <Link href="/" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/' && "text-emerald-500 hover:text-emerald-400")}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wider">HOME</span>
      </Link>
      <Link href="/charts" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/charts' && "text-emerald-500 hover:text-emerald-400")}>
        <BarChart2 className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wider">CHARTS</span>
      </Link>
      <Link href="/settings" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-neutral-200 transition-colors", pathname === '/settings' && "text-emerald-500 hover:text-emerald-400")}>
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wider">SETTINGS</span>
      </Link>
    </nav>
  );
}
