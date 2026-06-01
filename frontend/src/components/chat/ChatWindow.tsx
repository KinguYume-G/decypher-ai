"use client";

import { useEffect, useRef } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatWindowProps {
  messages: ChatMessageType[];
  loading?: boolean;
  onSend: (message: string, reportMode?: boolean) => Promise<void>;
  showReportTab?: boolean;
}

export function ChatWindow({
  messages,
  loading = false,
  onSend,
  showReportTab = false,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-full min-h-[500px] flex-col">
      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-lowest/30 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-3 h-2 w-2 rounded-full bg-secondary shadow-[0_0_12px_rgba(113,42,226,0.5)]" />
            <h2 className="font-headline-md text-lg text-on-surface">开始分析</h2>
            <p className="mt-2 max-w-xs text-sm text-on-surface-variant">
              {showReportTab
                ? "点击 Analyze 提问，或点击 Report 生成完整情报报告"
                : "输入问题，AI 将基于选中卡片给出深度分析"}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}

        {/* 流式加载时如果最后一条是空的，显示跳动点 */}
        {loading && (messages.length === 0 || messages[messages.length - 1].content === "") && (
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            AI 正在思考...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3">
        <ChatInput onSend={onSend} loading={loading} showReportTab={showReportTab} />
      </div>
    </div>
  );
}
