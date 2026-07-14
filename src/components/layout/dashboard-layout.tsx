"use client";

import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8 pt-[3.5rem] lg:pt-8 min-h-screen">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
