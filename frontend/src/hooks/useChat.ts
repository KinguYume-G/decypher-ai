"use client";

import { useEffect, useRef, useState } from "react";
import { chatAPI } from "@/lib/api";
import type { ChatMessage } from "@/types";

const STORAGE_KEY = (id?: number) => `chat_history_${id ?? "general"}`;

export function useChat(opportunityId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 恢复历史记录
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(opportunityId));
      setMessages(raw ? (JSON.parse(raw) as ChatMessage[]) : []);
    } catch {
      setMessages([]);
    }
  }, [opportunityId]);

  const persist = (msgs: ChatMessage[]) => {
    try { localStorage.setItem(STORAGE_KEY(opportunityId), JSON.stringify(msgs)); }
    catch { /* ignore */ }
  };

  const sendMessage = async (content: string, reportMode = false) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    // 取消上一个未完成的请求
    abortRef.current?.abort();

    const userMsg: ChatMessage       = { role: "user",      content: trimmed };
    const assistantMsg: ChatMessage  = { role: "assistant", content: "" };
    const withUser = [...messages, userMsg];
    const withBoth = [...withUser, assistantMsg];

    setMessages(withBoth);
    persist(withBoth);
    setLoading(true);

    let accumulated = "";

    abortRef.current = chatAPI.streamChat(
      {
        message:              trimmed,
        opportunity_id:       opportunityId,
        conversation_history: messages,
        report_mode:          reportMode,
      },
      // onChunk — 每个 token 追加到最后一条消息
      (chunk) => {
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      },
      // onDone
      () => {
        setLoading(false);
        const finalMsgs = [...withUser, { role: "assistant" as const, content: accumulated }];
        persist(finalMsgs);
      },
      // onError
      (_err) => {
        const fallback = "抱歉，AI 服务暂时无法响应，请稍后重试。";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fallback };
          return updated;
        });
        setLoading(false);
      },
    );
  };

  const clearMessages = () => {
    abortRef.current?.abort();
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY(opportunityId)); } catch { /* ignore */ }
  };

  return { messages, loading, sendMessage, clearMessages };
}
