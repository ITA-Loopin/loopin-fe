import type { LoopChecklist } from "@/types/loop";
import { ChecklistItem } from "./ChecklistItem";
import { IconButton } from "@/components/common/IconButton";
import { useEffect, useState } from "react";

type ChecklistProps = {
  checklists: LoopChecklist[];
  title?: string;
  onToggleItem?: (item: LoopChecklist) => void;
  // 체크리스트 추가 관련 props
  newChecklistContent?: string;
  onNewChecklistContentChange?: (content: string) => void;
  onAddChecklist?: () => void;
};

export function Checklist({
  checklists,
  title = "Checklist",
  onToggleItem,
  newChecklistContent,
  onNewChecklistContentChange,
  onAddChecklist,
}: ChecklistProps) {
  const [items, setItems] = useState<LoopChecklist[]>(checklists);

  useEffect(() => {
    setItems(checklists);
  }, [checklists]);

  const handleToggle = (target: LoopChecklist) => {
    const next = items.map((item) =>
      item.id === target.id ? { ...item, completed: !item.completed } : item
    );
    setItems(next);
    onToggleItem?.({ ...target, completed: !target.completed });
  };

  const showAddInput = newChecklistContent !== undefined && onNewChecklistContentChange && onAddChecklist;

  return (
    <section className="w-full">
      <h2 className="mb-2 text-[20px] font-bold text-[#2C2C2C]">
        {title}{" "}
        <span className="text-[16px] text-gray-500">· {items.length}</span>
      </h2>
      <ul className="flex flex-col items-end justify-center gap-[10px]">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={handleToggle} />
        ))}
        {showAddInput && (
          <li className="flex w-full items-start justify-between rounded-[10px] bg-white p-4">
            <div className="flex w-full items-center justify-between">
              <input
                type="text"
                placeholder="새로운 루틴을 추가해보세요"
                value={newChecklistContent}
                onChange={(event) => onNewChecklistContentChange(event.target.value)}
                className="flex-1 border-none bg-transparent text-base font-semibold leading-[150%] tracking-[-0.32px] placeholder:text-[#C6CCD1] outline-none focus:outline-none focus:ring-0"
              />
              <IconButton
                src="/addloopsheet/addloopsheet_add.svg"
                alt="루틴 추가"
                width={20}
                height={20}
                className="h-5 w-5"
                onClick={onAddChecklist}
              />
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}


