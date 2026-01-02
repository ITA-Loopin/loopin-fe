import type { LoopChecklist } from "@/types/loop";
import { IconButton } from "@/components/common/IconButton";

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
          <IconButton
            src={item.completed ? "/loop/loop_btn_complete.svg" : "/loop/loop_btn.svg"}
            alt={item.completed ? "체크리스트 완료" : "체크리스트 미완료"}
            width={24}
            height={24}
            onClick={() => onToggle?.(item)}
            className="h-6 w-6"
            imageClassName="h-6 w-6"
          />
      </div>
    </li>
  );
}


