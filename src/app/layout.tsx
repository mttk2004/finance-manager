import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Finance Manager",
  description: "Minimalist personal finance manager with multi-fund support and smart insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-neutral-200 min-h-screen overflow-x-hidden`}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen">
          <BottomNav />
          <div className="flex-1 pb-16 md:pb-0 md:px-8 md:py-6 overflow-y-auto w-full">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
