import { create } from "zustand";
import type { Opportunity, TaskCategory, User } from "@/types";

// ── Auth ────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("token") : false,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// ── Dashboard ────────────────────────────────────────────────
// 全局选中卡片：点击任意 OpportunityCard → 右侧 AI Analyst 联动

interface DashboardState {
  selectedCard: Opportunity | null;
  activeModule: TaskCategory | null; // null = 全部
  setSelectedCard: (card: Opportunity | null) => void;
  setActiveModule: (module: TaskCategory | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCard: null,
  activeModule: null,
  setSelectedCard: (card) => set({ selectedCard: card }),
  setActiveModule: (module) => set({ activeModule: module, selectedCard: null }),
}));
