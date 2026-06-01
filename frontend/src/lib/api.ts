import axios from "axios";
import type {
  APIResponse,
  ChatMessage,
  ChatResponse,
  Note,
  NoteCreate,
  NoteUpdate,
  Opportunity,
  Task,
  TaskCategory,
  TaskCreate,
  TokenOut,
  User,
} from "@/types";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

http.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token 过期或无效时自动清理并跳转登录页
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // 401 = token 无效/过期；403 = HTTPBearer 无 token 时的错误码
    if ((status === 401 || status === 403) && typeof window !== "undefined") {
      const isAuthRoute = window.location.pathname.includes("/login");
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    http.post<APIResponse<TokenOut>>("/api/v1/auth/register", data),

  login: (data: { email: string; password: string }) =>
    http.post<APIResponse<TokenOut>>("/api/v1/auth/login", data),

  me: () => http.get<APIResponse<User>>("/api/v1/auth/me"),
};

export const taskAPI = {
  list: () => http.get<APIResponse<Task[]>>("/api/v1/tasks"),
  create: (data: TaskCreate) => http.post<APIResponse<Task>>("/api/v1/tasks", data),
  get: (id: number) => http.get<APIResponse<Task>>(`/api/v1/tasks/${id}`),
  update: (id: number, data: Partial<TaskCreate & { is_active: boolean }>) =>
    http.patch<APIResponse<Task>>(`/api/v1/tasks/${id}`, data),
  delete: (id: number) => http.delete<APIResponse<null>>(`/api/v1/tasks/${id}`),
  run: (id: number) => http.post<APIResponse<{ message: string }>>(`/api/v1/tasks/${id}/run`),
};

export const opportunityAPI = {
  list: (params?: { task_id?: number; category?: TaskCategory; limit?: number }) =>
    http.get<APIResponse<Opportunity[]>>("/api/v1/opportunities", { params }),
  get: (id: number) => http.get<APIResponse<Opportunity>>(`/api/v1/opportunities/${id}`),
};

export const cardsAPI = {
  list: (params?: { category?: TaskCategory | null; limit?: number; favorited?: boolean }) =>
    http.get<APIResponse<Opportunity[]>>("/api/v1/cards", { params }),
  toggleFavorite: (id: number) =>
    http.post<APIResponse<{ is_favorited: boolean }>>(`/api/v1/cards/${id}/favorite`),
};

export const seedAPI = {
  run: () => http.post<APIResponse<{ tasks_created: number; task_ids: number[]; message: string }>>("/api/v1/seed"),
};

export const notesAPI = {
  list:   ()                        => http.get<APIResponse<Note[]>>("/api/v1/notes"),
  create: (data: NoteCreate)        => http.post<APIResponse<Note>>("/api/v1/notes", data),
  update: (id: number, data: NoteUpdate) => http.patch<APIResponse<Note>>(`/api/v1/notes/${id}`, data),
  delete: (id: number)              => http.delete<APIResponse<null>>(`/api/v1/notes/${id}`),
};

export const chatAPI = {
  message: (data: {
    message: string;
    opportunity_id?: number;
    conversation_history?: ChatMessage[];
    report_mode?: boolean;
  }) => http.post<APIResponse<ChatResponse>>("/api/v1/chat/message", data),

  /**
   * SSE 流式聊天。每收到一个 token 调用 onChunk，结束时调用 onDone。
   * 返回 AbortController 供调用方取消。
   */
  streamChat: (
    data: {
      message: string;
      opportunity_id?: number;
      conversation_history?: ChatMessage[];
      report_mode?: boolean;
    },
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError?: (err: string) => void,
  ): AbortController => {
    const controller = new AbortController();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    (async () => {
      try {
        const res = await fetch(`${baseURL}/api/v1/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          onError?.(`HTTP ${res.status}`);
          onDone();
          return;
        }

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") { onDone(); return; }
            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === "delta" && parsed.content) onChunk(parsed.content);
              if (parsed.type === "error") onError?.(parsed.content);
            } catch { /* skip malformed */ }
          }
        }
        onDone();
      } catch (e) {
        if ((e as Error).name !== "AbortError") onError?.(String(e));
        onDone();
      }
    })();

    return controller;
  },
};
