"use client";

import AppShell from "@/components/layout/AppShell";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <AppShell>
      <main className="px-6 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Bell size={18} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
            <p className="text-sm text-on-surface-variant">Stay updated on your intelligence pipeline.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <Bell size={26} className="text-outline" />
          </div>
          <h2 className="text-base font-semibold text-on-surface">All caught up</h2>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
            Notifications will appear here when tasks complete, new signals are detected, or reports are ready.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
