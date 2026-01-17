"use client";

import type { ChatMessage } from "../types";

export function MessageBubble({
  message,
  className,
}: {
  message: ChatMessage;
  className?: string;
}) {
  const isUser = message.author === "user";

  return (
    <div
      className={`w-full flex mb-4 ${isUser ? "justify-end" : "justify-start"} ${className || ""}`}
    >
      <div
        className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${isUser ? "bg-[#FFE4E0]" : "bg-white"} text-[#2C2C2C]`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default MessageBubble;
