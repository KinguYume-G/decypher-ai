"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bookmark, LayoutDashboard, LogOut, MessageSquare, Plus, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: Target },
    { href: "/saved", label: "Opportunities", icon: Bookmark },
    { href: "/chat", label: "Deep Dive", icon: MessageSquare },
    { href: "/market", label: "Insights", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.12),_transparent_32rem),radial-gradient(circle_at_bottom_left,_rgba(5,102,217,0.10),_transparent_30rem)]">
      <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 h-full p-4 space-y-6 z-50 bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-primary/5">
        <div className="flex flex-col gap-1 px-2 mb-4 mt-2">
          <span className="font-display-xl text-headline-md font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Decypher AI</span>
          <span className="text-xs font-label-sm text-on-surface-variant tracking-widest uppercase">Opportunity OS</span>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/chat" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                )}
              >
                <Icon size={18} />
                <span className="font-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link href="/tasks" className="mx-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container px-4 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
          <Plus size={16} />
          New task
        </Link>
        <div className="pt-6 mt-auto border-t border-white/5 flex flex-col gap-2">
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-container flex items-center justify-center text-primary font-bold text-sm">
              {(user?.username ?? "AI").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <span className="truncate text-sm font-bold text-on-surface">{user?.username ?? "Guest"}</span>
              <span className="truncate text-[10px] text-primary">{user?.email ?? "Local session"}</span>
            </div>
            <button onClick={logout} className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="md:ml-64 flex-1 w-full min-h-screen relative flex flex-col pb-20 md:pb-0">
        {children}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-16 z-50">
        {navItems.slice(0, 4).map((item) => {
          const active = pathname === item.href || (item.href !== "/chat" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                active ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-label-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
