import type { MouseEvent } from "react";
import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";

type ChecklistToggleButtonProps = {
  checked: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function ChecklistToggleButton({
  checked,
  onClick,
  className,
}: ChecklistToggleButtonProps) {
  return (
    <IconButton
      src={checked ? "/loop/loop_btn_complete.svg" : "/loop/loop_btn.svg"}
      alt={checked ? "체크리스트 완료" : "체크리스트 미완료"}
      width={24}
      height={24}
      onClick={onClick}
      className={cn("h-6 w-6", className)}
      imageClassName="h-6 w-6"
    />
  );
}


