export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: User;
}

export type TaskCategory = "market" | "research" | "startup" | "stocks" | "jobs";

export interface Task {
  id: number;
  user_id: number;
  name: string;
  category: TaskCategory;
  keywords: string[];
  sources: string[];
  interval_seconds: number;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  created_at: string;
}

export interface TaskCreate {
  name: string;
  keywords: string[];
  sources: string[];
  interval_seconds?: number;
  category?: TaskCategory;
}

export interface Opportunity {
  id: number;
  task_id: number;
  category: TaskCategory;
  title: string;
  what_to_build: string;
  why_it_matters: string;
  how_to_execute: string;
  score_trend: number;
  score_novelty: number;
  score_competition: number;
  score_feasibility: number;
  score_commercial: number;
  score_total: number;
  keywords_matched: string[];
  source_signals: string[];
  is_favorited: boolean;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  role: "assistant";
  content: string;
}
