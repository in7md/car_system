"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // If loading or not authenticated, render standard layout without shell
  if (status === "loading" || !session) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = ((session.user as any)?.role || "").toUpperCase();

  // The Employee has a different, simplified layout
  if (role === "EMPLOYEE") {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-0">
        <TopNavbar session={session} role={role} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          {children}
        </main>
        <MobileBottomNav role={role} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNavbar session={session} role={role} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
      <MobileBottomNav role={role} />
    </div>
  );
}
