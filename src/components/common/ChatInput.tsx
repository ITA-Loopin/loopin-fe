"use client";

import Image from "next/image";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

export interface ChatInputProps<T extends FieldValues> {
  placeholder?: string;
  disabled?: boolean;
  showAttachmentButton?: boolean;
  sendButtonIcon?: "arrow" | "send";
  control: Control<T>;
  name: Path<T>;
  watchedValue?: string;
  ariaLabel?: string;
  sendButtonAriaLabel?: string;
  onSubmit?: () => void;
}

export function ChatInput<T extends FieldValues>({
  placeholder = "메시지를 입력해주세요",
  disabled = false,
  showAttachmentButton = false,
  sendButtonIcon = "send",
  control,
  name,
  watchedValue,
  ariaLabel,
  sendButtonAriaLabel = "메시지 전송",
  onSubmit,
}: ChatInputProps<T>) {

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#F8F8F9] px-3 py-2">
      {showAttachmentButton && (
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center flex-shrink-0"
          aria-label="파일 첨부"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="#737980"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            ref={field.ref}
            placeholder={placeholder}
            rows={1}
            className="flex-1 h-10 border-none bg-transparent text-sm text-[#2C2C2C] outline-none resize-none"
            style={{ 
              lineHeight: "20px",
              paddingTop: "10px",
              paddingBottom: "10px"
            }}
            aria-label={ariaLabel || "메시지 입력란"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const currentValue = watchedValue?.trim();
                if (currentValue && !disabled && onSubmit) {
                  onSubmit();
                }
              }
            }}
          />
        )}
      />
      <button
        type="submit"
        disabled={!watchedValue?.trim() || disabled}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
        aria-label={sendButtonAriaLabel}
      >
        {sendButtonIcon === "arrow" ? (
          <Image
            src="/ai-planner/arrows-up.svg"
            alt="send"
            width={24}
            height={24}
          />
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
