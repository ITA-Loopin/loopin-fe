import type { LoopChecklist } from "@/types/loop";
import { ChecklistToggleButton } from "./ChecklistToggleButton";

type ChecklistItemProps = {
  item: LoopChecklist;
  onToggle?: (item: LoopChecklist) => void;
};

export function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <li
      className={`flex h-14 w-full items-center justify-between gap-[10px] rounded-[10px] px-4 transition-colors ${
        item.completed ? "bg-[#F2F3F5]" : "bg-white"
      }`}
    >
      <span
        className="text-sm font-medium text-[#2C2C2C]"
      >
        {item.content}
      </span>
      <ChecklistToggleButton
        checked={item.completed}
        onClick={() => onToggle?.(item)}
      />
    </li>
  );
}


