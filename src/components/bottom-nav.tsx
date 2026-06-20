'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Settings, BarChart2, Receipt } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (pathname === '/login') return null;

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
    return `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer group ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;
  };

  const handleOpenCreateModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', 'create-transaction');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <nav className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-xl border border-border rounded-full px-8 py-4 z-50 shadow-2xl items-center gap-12">
        <Link href="/" className={getLinkClass('/')}>
          <div className="relative">
            <Home className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname === '/' && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>}
          </div>
        </Link>
        <Link href="/transactions" className={getLinkClass('/transactions')}>
          <div className="relative">
            <Receipt className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/transactions') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>}
          </div>
        </Link>
        {/* Desktop Quick Add Action inside BottomNav */}
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-accent text-white hover:bg-primary-accent/90 shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Thêm giao dịch nhanh"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <Link href="/charts" className={getLinkClass('/charts')}>
          <div className="relative">
            <BarChart2 className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/charts') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>}
          </div>
        </Link>
        <Link href="/settings" className={getLinkClass('/settings')}>
          <div className="relative">
            <Settings className="w-5 h-5 transition-transform group-active:scale-95" />
            {pathname.startsWith('/settings') && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full"></div>}
          </div>
        </Link>
      </nav>

      {/* Mobile Nav with center FAB */}
      <nav className="md:hidden fixed bottom-0 w-full left-0 bg-background/95 backdrop-blur-xl border-t border-border flex justify-around items-center h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] z-50">
        <Link href="/" className={getLinkClass('/')}>
          <Home className="w-5 h-5" />
        </Link>
        <Link href="/transactions" className={getLinkClass('/transactions')}>
          <Receipt className="w-5 h-5" />
        </Link>
        
        {/* Mobile FAB */}
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-accent text-white shadow-lg active:scale-95 transition-transform -translate-y-3 border-4 border-background cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>

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
