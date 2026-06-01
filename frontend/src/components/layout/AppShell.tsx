"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const NAV_MAIN = [
  { href: "/dashboard", label: "Home",         icon: "home" },
  { href: "/stocks",    label: "Market Pulse",  icon: "candlestick_chart" },
  { href: "/saved",     label: "Saved",         icon: "favorite" },
  { href: "/notes",     label: "Notes",         icon: "description" },
] as const;

const NAV_SECONDARY = [
  { href: "/premium",       label: "Upgrade",      icon: "star" },
  { href: "/settings",      label: "Settings",     icon: "settings" },
  { href: "/notifications", label: "Notifications",icon: "notifications" },
] as const;

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home",   icon: "home" },
  { href: "/saved",     label: "Saved",  icon: "favorite" },
  { href: "/notes",     label: "Notes",  icon: "description" },
  { href: "/settings",  label: "More",   icon: "settings" },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function AppShell({ children, rightPanel }: AppShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authAPI.me()
        .then((res) => { if (res.data.data) setAuth(res.data.data, token); })
        .catch(() => {});
    }
  }, [token, user, setAuth]);

  const logout = () => { clearAuth(); router.push("/login"); };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const initials = (user?.username ?? "AI").slice(0, 2).toUpperCase();
  const hasRight = Boolean(rightPanel);

  return (
    <div className="flex min-h-screen w-full bg-surface overflow-hidden">

      {/* ── Left Sidebar (240px fixed) ───────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-white border-r border-outline-variant/40 flex-col z-50">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-outline-variant/30">
          <p className="text-[17px] font-bold text-on-surface tracking-tight">Decypher AI</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Intelligence Platform</p>
        </div>

        {/* Main nav — top section */}
        <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto">
          {NAV_MAIN.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary/10 text-secondary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section: secondary nav + user profile */}
        <div className="px-3 pb-3 border-t border-outline-variant/30 pt-3 space-y-0.5">
          {/* Upgrade / Settings / Notifications */}
          {NAV_SECONDARY.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  item.href === "/premium"
                    ? "text-amber-600 hover:bg-amber-50"
                    : active
                      ? "bg-secondary/10 text-secondary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* User profile — very bottom */}
          <div className="flex items-center gap-3 px-2 py-2 mt-1 border-t border-outline-variant/20 pt-3">
            <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-secondary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">
                {user?.username ?? "Analyst"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">Senior Analyst</p>
            </div>
            <button
              onClick={logout}
              className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className={cn(
        "flex-1 min-h-screen flex flex-col pb-16 md:pb-0",
        "md:ml-[240px]",
        hasRight && "md:mr-[340px]"
      )}>
        {children}
      </div>

      {/* ── Right fixed panel (340px, only when provided) ─────────── */}
      {hasRight && (
        <aside className="hidden md:flex fixed right-0 top-0 h-full w-[340px] bg-white border-l border-outline-variant/40 flex-col z-50">
          {rightPanel}
        </aside>
      )}

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-outline-variant/30 flex justify-around items-center h-14 z-50">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors",
                active ? "text-secondary" : "text-on-surface-variant"
              )}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
