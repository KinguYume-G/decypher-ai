import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-sm", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary-container"
            : "bg-secondary/10"
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-sm",
            isUser ? "text-on-primary" : "text-secondary"
          )}
        >
          {isUser ? "person" : "smart_toy"}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] p-sm rounded-2xl font-body-md text-sm leading-relaxed",
          isUser
            ? "bg-secondary text-white rounded-tr-none"
            : "bg-surface-container-high/50 text-on-surface rounded-tl-none"
        )}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1.5" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
