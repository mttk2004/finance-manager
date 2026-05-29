import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import Providers from './providers';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Personal Finance Manager',
  description: 'Minimalist personal finance manager with multi-fund support and smart insights.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
