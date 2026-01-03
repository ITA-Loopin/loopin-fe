import type { LoopChecklist } from "@/types/loop";
import { ChecklistItem } from "./ChecklistItem";
import { IconButton } from "@/components/common/IconButton";
import { useEffect, useState } from "react";

type ChecklistProps = {
  checklists: LoopChecklist[];
  title?: string;
  onToggleItem?: (item: LoopChecklist) => void;
  onDeleteItem?: (itemId: number) => void;
  // 체크리스트 추가 관련 props
  newChecklistContent?: string;
  onNewChecklistContentChange?: (content: string) => void;
  onAddChecklist?: () => void;
};

export function Checklist({
  checklists,
  onToggleItem,
  onDeleteItem,
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
      {/* 체크리스트 개수 */}
      <h2 className="mb-2 text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-black">
        {"Checklist"}
        <span className="text-center text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[#737980]">· {items.length}</span>
      </h2>
      {/* 체크리스트 목록 */}
      <ul className="flex flex-col items-end justify-center gap-[10px]">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onDelete={onDeleteItem}
          />
        ))}
        {/* 체크리스트 추가 입력 */}
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


