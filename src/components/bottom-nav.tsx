'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BarChart2, Receipt } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
    return `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer group ${isActive ? 'text-white' : 'text-neutral-500 hover:text-white'}`;
  };

  return (
    <>
      <nav className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 bg-[#121212]/80 backdrop-blur-xl border border-white/[0.05] rounded-full px-8 py-4 z-50 shadow-2xl items-center gap-12">
        <Link href="/" className={getLinkClass('/')}>
          <div className="relative">
            <Home className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname === '/' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
          </div>
        </Link>
        <Link href="/transactions" className={getLinkClass('/transactions')}>
          <div className="relative">
            <Receipt className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/transactions') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
          </div>
        </Link>
        <Link href="/charts" className={getLinkClass('/charts')}>
          <div className="relative">
            <BarChart2 className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/charts') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
          </div>
        </Link>
        <Link href="/settings" className={getLinkClass('/settings')}>
          <div className="relative">
            <Settings className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/settings') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
          </div>
        </Link>
      </nav>

      <nav className="md:hidden fixed bottom-0 w-full left-0 bg-[#050505]/95 backdrop-blur-xl border-t border-white/[0.05] flex justify-around items-center h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] z-50">
        <Link href="/" className={getLinkClass('/')}>
          <Home className="w-5 h-5" />
        </Link>
        <Link href="/transactions" className={getLinkClass('/transactions')}>
          <Receipt className="w-5 h-5" />
        </Link>
        <Link href="/charts" className={getLinkClass('/charts')}>
          <BarChart2 className="w-5 h-5" />
        </Link>
        <Link href="/settings" className={getLinkClass('/settings')}>
          <Settings className="w-5 h-5" />
        </Link>
      </nav>
    </>
  );
}
