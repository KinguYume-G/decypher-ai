import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-4", isUser && "justify-end")}>
      {!isUser ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Bot size={18} />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-3xl rounded-xl px-4 py-3 text-sm leading-6",
          isUser
            ? "bg-primary text-on-primary"
            : "glass-panel border-white/5 text-on-surface"
        )}
      >
        {message.content.split("\n").map((line, index) => (
          <p key={index} className={index > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </div>
      {isUser ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-on-surface">
          <User size={18} />
        </div>
      ) : null}
    </div>
  );
}
