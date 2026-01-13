import { useId } from "react";
import { cn } from "@/lib/utils";

type TitleInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
};

export function TitleInput({
  id,
  value,
  onChange,
  placeholder = "루프의 이름을 적어주세요",
  maxLength,
  disabled,
  className,
}: TitleInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2 mb-10">
      <span className="text-caption-r text-[var(--gray-500)]">루프 이름</span>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "flex h-[50px] w-full items-center gap-2.5 rounded-[10px] border border-[var(--gray-300)] bg-[var(--gray-white)] px-4 py-[13px] text-body-1-sb font-semibold text-[var(--gray-black)] placeholder:text-[var(--gray-400)] focus:outline-none",
          className
        )}
      />
    </label>
  );
}
