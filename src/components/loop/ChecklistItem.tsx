import type { LoopChecklist } from "@/types/loop";
import { ChecklistToggleButton } from "./ChecklistToggleButton";

type ChecklistItemProps = {
  item: LoopChecklist;
  onToggle?: (item: LoopChecklist) => void;
};

export function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <li className={`flex w-full flex-col items-start gap-[10px] rounded-[10px] p-4 ${item.completed ? "bg-[#F0F2F3]" : "bg-white"}`}>
      <div className="flex w-full items-center justify-between">
          <span className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
            {item.content}
          </span>
          <ChecklistToggleButton
            checked={item.completed}
            onClick={() => onToggle?.(item)}
          />
      </div>
    </li>
  );
}


