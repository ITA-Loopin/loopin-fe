"use client";

import type { ChatMessage } from "../types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.author === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} `}>
      <div
        className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed rounded-bl-md bg-white text-[#2C2C2C]`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default MessageBubble;
