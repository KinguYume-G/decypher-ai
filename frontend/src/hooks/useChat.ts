"use client";

import { useState } from "react";
import { chatAPI } from "@/lib/api";
import type { ChatMessage } from "@/types";

export function useChat(opportunityId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await chatAPI.message({
        message: trimmed,
        opportunity_id: opportunityId,
        conversation_history: messages,
      });
      const reply = res.data.data!;
      setMessages([...nextMessages, reply]);
    } catch (e) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "I could not reach the analysis service. Check the backend and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, loading, sendMessage, clearMessages };
}
