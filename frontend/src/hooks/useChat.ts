"use client";

import { useEffect, useRef, useState } from "react";
import { chatAPI } from "@/lib/api";
import type { ChatMessage, Citation } from "@/types";

const STORAGE_KEY = (id?: number) => `chat_history_${id ?? "general"}`;

export function useChat(opportunityId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<number | undefined>(undefined);

  // Prefer durable server history; local storage remains an offline fallback.
  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const response = await chatAPI.conversations();
        const conversation = (response.data.data ?? []).find(
          (item) => item.opportunity_id === (opportunityId ?? null),
        );
        if (!cancelled && conversation) {
          conversationIdRef.current = conversation.id;
          setMessages(conversation.messages.map(({ role, content, citations }) => ({ role, content, citations })));
          return;
        }
      } catch {
        // Fall through to the local cache when offline or unauthenticated.
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY(opportunityId));
        if (!cancelled) setMessages(raw ? (JSON.parse(raw) as ChatMessage[]) : []);
      } catch {
        if (!cancelled) setMessages([]);
      }
    };
    void loadHistory();
    return () => { cancelled = true; };
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
    let citations: Citation[] = [];

    abortRef.current = chatAPI.streamChat(
      {
        message:              trimmed,
        opportunity_id:       opportunityId,
        conversation_history: messages,
        report_mode:          reportMode,
        conversation_id:      conversationIdRef.current,
      },
      // onChunk — 每个 token 追加到最后一条消息
      (chunk) => {
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated, citations };
          return updated;
        });
      },
      // onDone
      () => {
        setLoading(false);
        const finalMsgs = [...withUser, { role: "assistant" as const, content: accumulated, citations }];
        persist(finalMsgs);
      },
      // onError
      () => {
        const fallback = "抱歉，AI 服务暂时无法响应，请稍后重试。";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fallback };
          return updated;
        });
        setLoading(false);
      },
      // onMeta — server-side conversation identity and citations
      (meta) => {
        conversationIdRef.current = meta.conversation_id;
        citations = meta.citations;
      },
    );
  };

  const clearMessages = () => {
    abortRef.current?.abort();
    setMessages([]);
    conversationIdRef.current = undefined;
    try { localStorage.removeItem(STORAGE_KEY(opportunityId)); } catch { /* ignore */ }
  };

  return { messages, loading, sendMessage, clearMessages };
}
