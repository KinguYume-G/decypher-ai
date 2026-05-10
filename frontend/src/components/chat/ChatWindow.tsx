"use client";

import { useEffect, useRef } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatWindowProps {
  messages: ChatMessageType[];
  loading?: boolean;
  onSend: (message: string) => Promise<void>;
}

export function ChatWindow({ messages, loading = false, onSend }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-full min-h-[620px] flex-col">
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto rounded-xl border border-white/5 bg-black/10 p-5">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_rgba(210,187,255,0.8)]" />
            <h2 className="font-headline-md text-xl text-on-surface">Start a focused deep dive</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
              Ask for market risk, buyer persona, MVP scope, pricing, competitors, or the next validation experiment.
            </p>
          </div>
        ) : (
          messages.map((message, index) => <ChatMessage key={index} message={message} />)
        )}
        {loading ? (
          <ChatMessage message={{ role: "assistant", content: "Analyzing the opportunity..." }} />
        ) : null}
        <div ref={endRef} />
      </div>
      <div className="mt-4">
        <ChatInput onSend={onSend} loading={loading} />
      </div>
    </div>
  );
}
