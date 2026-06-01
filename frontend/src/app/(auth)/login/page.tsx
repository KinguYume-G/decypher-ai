"use client";

import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = React.useState<Mode>("login");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const username = String(form.get("username") || "");
        await register(email, username, password);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (mode === "login"
          ? "登录失败，请检查邮箱和密码。"
          : "注册失败，请尝试其他邮箱或用户名。");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden bg-surface">
      {/* Decorative background orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-on-tertiary-container/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <main className="w-full max-w-[480px] px-md z-10 flex flex-col items-center">
        <div className="glass-card rounded-xl p-md md:p-lg w-full relative overflow-hidden">
          {/* Logo */}
          <div className="flex flex-col items-center mb-md text-center">
            <h1 className="font-headline-lg text-headline-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-on-tertiary-container">
              Decypher AI
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs max-w-[300px]">
              {mode === "login"
                ? "登录情报分析平台，解锁 AI 驱动的机会洞察。"
                : "创建账号，开始监控全球创业市场信号。"}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-lg bg-surface-container border border-outline-variant/20 p-xs mb-md">
            {(["login", "register"] as Mode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`flex-1 py-sm rounded-md font-label-md text-label-md transition-all duration-200 ${
                  mode === tab
                    ? "bg-secondary/10 text-secondary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                电子邮箱
              </label>
              <div className="relative flex items-center border border-outline-variant/30 rounded-lg bg-surface-container-low/50 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                <span className="material-symbols-outlined ml-sm text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  name="email"
                  className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 h-11 px-sm font-body-md text-sm outline-none"
                  placeholder="name@company.ai"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Username (register only) */}
            {mode === "register" && (
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                  用户名
                </label>
                <div className="relative flex items-center border border-outline-variant/30 rounded-lg bg-surface-container-low/50 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                  <span className="material-symbols-outlined ml-sm text-on-surface-variant text-[20px]">
                    person
                  </span>
                  <input
                    name="username"
                    className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 h-11 px-sm font-body-md text-sm outline-none"
                    placeholder="your_handle"
                    type="text"
                    minLength={3}
                    maxLength={100}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                密码
              </label>
              <div className="relative flex items-center border border-outline-variant/30 rounded-lg bg-surface-container-low/50 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                <span className="material-symbols-outlined ml-sm text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  name="password"
                  className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 h-11 px-sm font-body-md text-sm outline-none"
                  placeholder={
                    mode === "register" ? "至少 8 位，含字母和数字" : "••••••••"
                  }
                  type="password"
                  minLength={mode === "register" ? 8 : 1}
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className="w-full h-12 accent-gradient-bg rounded-xl font-label-md text-label-md font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-sm shadow-lg shadow-secondary/20 hover:opacity-90 mt-xs"
              type="submit"
              disabled={loading}
            >
              {loading
                ? mode === "login"
                  ? "登录中..."
                  : "注册中..."
                : mode === "login"
                ? "登录"
                : "创建账号"}
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>

        {/* Status bar */}
        <div className="mt-md w-full glass-card rounded-xl h-14 flex items-center justify-center gap-sm px-md">
          <div className="w-2 h-2 rounded-full bg-on-tertiary-container shadow-[0_0_8px_rgba(0,144,169,0.6)] flex-shrink-0" />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            ENGINE READY · SIGNALS ACTIVE · AI ONLINE
          </p>
        </div>
      </main>
    </div>
  );
}
