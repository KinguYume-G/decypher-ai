"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { FileText, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, reportMode?: boolean) => Promise<void>;
  loading?: boolean;
  showReportTab?: boolean;
}

export function ChatInput({ onSend, loading = false, showReportTab = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = async (e: FormEvent, reportMode = false) => {
    e.preventDefault();
    const message = value.trim();
    if (!message || loading) return;
    setValue("");
    await onSend(message, reportMode);
  };

  return (
    <form
      onSubmit={(e) => submit(e, false)}
      className="bg-surface-container-low/50 border border-outline-variant/20 rounded-xl p-2"
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit(e as unknown as FormEvent, false);
            }
          }}
          placeholder="询问市场、科研、创业、股市或求职情报..."
          disabled={loading}
          className="w-full bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 outline-none py-2 px-2 pr-20 disabled:opacity-60"
        />
        {/* 操作按钮组 */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Report 按钮（只在有卡片时显示）*/}
          {showReportTab && (
            <button
              type="button"
              disabled={!value.trim() || loading}
              onClick={(e) => {
                e.preventDefault();
                void submit(e as unknown as FormEvent, true);
              }}
              title="生成报告"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-secondary border border-secondary/20 hover:bg-secondary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileText size={12} />
              Report
            </button>
          )}
          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="rounded-lg p-1.5 text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="发送"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}
