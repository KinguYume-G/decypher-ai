import axios from "axios";
import type {
  APIResponse,
  ChatMessage,
  ChatResponse,
  Opportunity,
  Task,
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
  list: (params?: { task_id?: number; limit?: number }) =>
    http.get<APIResponse<Opportunity[]>>("/api/v1/opportunities", { params }),
  get: (id: number) => http.get<APIResponse<Opportunity>>(`/api/v1/opportunities/${id}`),
};

export const chatAPI = {
  message: (data: {
    message: string;
    opportunity_id?: number;
    conversation_history?: ChatMessage[];
  }) => http.post<APIResponse<ChatResponse>>("/api/v1/chat/message", data),
};
