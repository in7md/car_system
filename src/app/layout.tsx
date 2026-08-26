import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import AppShell from "@/components/layout/AppShell";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Car Management System - InventraX",
  description: "Modern Enterprise SaaS for Car Showrooms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
        <NextAuthProvider>
          <AppShell>{children}</AppShell>
        </NextAuthProvider>
      </body>
    </html>
  );
}
