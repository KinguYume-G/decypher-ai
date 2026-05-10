"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
}

export function ChatInput({ onSend, loading = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = value.trim();
    if (!message || loading) return;
    setValue("");
    await onSend(message);
  };

  return (
    <form onSubmit={submit} className="glass-panel rounded-xl p-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submit(event);
          }
        }}
        rows={2}
        placeholder="Ask about risk, MVP scope, customers, pricing, or next validation steps..."
        className="min-h-[68px] w-full resize-none rounded-lg border-none bg-transparent p-3 text-sm text-on-surface outline-none placeholder:text-outline focus:ring-0"
      />
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-xs text-on-surface-variant">Enter to send · Shift Enter for newline</span>
        <Button type="submit" loading={loading} disabled={!value.trim()}>
          <Send size={16} />
          Send
        </Button>
      </div>
    </form>
  );
}
