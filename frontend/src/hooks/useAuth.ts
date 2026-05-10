"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data.data!;
    setAuth(userData, access_token);
    toast.success(`欢迎回来，${userData.username}`);
    router.push("/dashboard");
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await authAPI.register({ email, username, password });
    const { access_token, user: userData } = res.data.data!;
    setAuth(userData, access_token);
    toast.success("注册成功！");
    router.push("/dashboard");
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return { user, isAuthenticated, login, register, logout };
}
