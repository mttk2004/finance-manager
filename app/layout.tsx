import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import Providers from './providers';
import { BottomNav } from '@/components/bottom-nav';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Personal Finance Manager',
  description: 'Minimalist personal finance manager with multi-fund support and smart insights.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning className="bg-[#0a0a0a] text-neutral-200 min-h-screen">
        <Providers>
          <div className="mx-auto max-w-md min-h-screen bg-[#0a0a0a] border-x border-white/5 relative flex flex-col shadow-2xl overflow-x-hidden">
            <div className="flex-1 pb-16">
              {children}
            </div>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
