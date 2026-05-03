"use client";

import type { LoopChecklist } from "@/types/loop";
import { ChecklistItem } from "./ChecklistItem";
import { IconButton } from "@/components/common/IconButton";
import { useEffect, useState, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const showAddInput = !!(onNewChecklistContentChange && onAddChecklist);

  /**
   * 입력값이 있으면 추가(커밋)
   * - 성공하면 true, 아니면 false
   */
  const commitNewChecklist = () => {
    if (!showAddInput) return false;

    const value = (newChecklistContent ?? "").trim();
    if (!value) return false;

    onAddChecklist?.();
    return true;
  };

  /**
   * + 버튼:
   * - 입력값 있으면 추가
   * - 비어있으면 포커스
   */
  const handleAddButtonClick = () => {
    if (!inputRef.current) return;

    const didAdd = commitNewChecklist();
    if (!didAdd) {
      inputRef.current.focus();
    }
  };

  /**
   * Enter:
   * - 입력값 있으면 추가
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const didAdd = commitNewChecklist();
    if (didAdd) e.preventDefault();
  };

  /**
   * 체크리스트 입력에서 포커스가 빠질 때(= 바깥 클릭 포함)
   * - 입력값 있으면 추가
   */
  const handleInputBlur = () => {
    commitNewChecklist();
  };

  return (
    <section className="w-full">
      {/* 체크리스트 개수 */}
      <h2 className="mb-4 text-title-2-b text-[var(--gray-black)]">
        {"Checklist"}
        <span className="text-center text-body-2-sb font-semibold text-[var(--gray-600)]">
          · {items.length}
        </span>
      </h2>

      {/* 체크리스트 목록 */}
      <ul className="flex flex-col items-end justify-center gap-[10px]">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={onToggleItem ? handleToggle : undefined}
            onDelete={onDeleteItem}
          />
        ))}

        {/* 체크리스트 추가 입력 */}
        {showAddInput && (
          <li className="flex w-full items-start justify-between rounded-[10px] bg-white p-4">
            <div className="flex w-full items-center justify-between">
              <input
                ref={inputRef}
                type="text"
                placeholder="새로운 루틴을 추가해보세요"
                value={newChecklistContent || ""}
                onChange={(event) =>
                  onNewChecklistContentChange?.(event.target.value)
                }
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                className="flex-1 border-none bg-transparent text-body-1-sb font-semibold placeholder:text-[var(--gray-400)] outline-none focus:outline-none"
              />

              <div onMouseDown={(e) => e.preventDefault()}>
                <IconButton
                  src="/addloopsheet/addloopsheet_add.svg"
                  alt="루틴 추가"
                  width={20}
                  height={20}
                  onClick={handleAddButtonClick}
                />
              </div>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
