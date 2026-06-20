import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/query-provider";
import { GlobalErrorBoundary } from "@/components/global-error-boundary";
import NextTopLoader from 'nextjs-toploader';

import { AccentProvider } from "@/components/accent-provider";
import { GlobalTransactionModals } from "@/components/global-transaction-modals";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Tài chính cá nhân",
  description: "Quản lý tài chính cá nhân thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased selection:bg-primary-accent/30`}>
        <NextTopLoader 
          color="var(--primary-accent)" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px var(--primary-accent),0 0 5px var(--primary-accent)" 
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AccentProvider>
            <GlobalErrorBoundary>
              <QueryProvider>
                <div className="flex flex-col min-h-screen bg-background">
                  <Suspense fallback={null}>
                    <BottomNav />
                  </Suspense>
                  <div className="flex-1 pb-20 md:pb-0 md:pt-20 md:px-8 overflow-y-auto w-full">
                    {children}
                  </div>
                </div>
                <GlobalTransactionModals />
                <Toaster position="bottom-right" expand={false} richColors />
              </QueryProvider>
            </GlobalErrorBoundary>
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
