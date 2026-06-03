import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
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
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
            <BottomNav />
            <div className="flex-1 pb-16 md:pb-0 md:pt-20 md:px-8 overflow-y-auto w-full">
              {children}
            </div>
          </div>
          <Toaster position="top-center" expand={false} richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
