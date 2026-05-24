import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Checklist } from "./constants";
import { useRef } from "react";

type ChecklistEditorProps = {
  checklists: Checklist[];
  onChangeChecklist: (id: string, text: string) => void;
  onRemoveChecklist: (id: string) => void;
  newChecklistItem: string;
  onChangeNewChecklist: (value: string) => void;
  onAddChecklist: () => void;
};

export function ChecklistEditor({
  checklists,
  onChangeChecklist,
  onRemoveChecklist,
  newChecklistItem,
  onChangeNewChecklist,
  onAddChecklist,
}: ChecklistEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const itemContainerStyles =
     
    "flex w-full items-start justify-between rounded-[10px] bg-gray-100 p-4";
  const baseInputStyles =
     
    "flex-1 w-full border-none bg-transparent px-0 py-0 text-body-1-sb font-semibold text-gray-black placeholder:text-gray-400 focus:outline-none";

  const trimmedValue = newChecklistItem.trim();

  const handleAddButtonClick = () => {
    // 입력값이 있으면 추가, 없으면 포커스
    if (trimmedValue) {
      onAddChecklist();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && trimmedValue) {
      e.preventDefault();
      onAddChecklist();
    }
  };

  return (
    <div 
      className="flex flex-col items-start gap-2 self-stretch"
    >
      { }
      <p className="text-caption-r text-gray-500">
        체크리스트
      </p>

      <div className="flex w-full flex-col items-start gap-[10px]">
        {checklists.map((item) => (
          <div key={item.id} className={itemContainerStyles}>
            <input
              type="text"
              value={item.text}
              onChange={(event) => onChangeChecklist(item.id, event.target.value)}
              className={baseInputStyles}
            />
            <Button
              variant="icon"
              onClick={() => onRemoveChecklist(item.id)}
              aria-label="체크리스트 삭제"
            >
              <Image
                src="/addloopsheet/addloopsheet_delete.svg"
                alt="체크리스트 삭제"
                width={20}
                height={20}
                style={{ width: 20, height: 20 }}
              />
            </Button>
          </div>
        ))}

        <div className={itemContainerStyles} data-checklist-input-container>
          <input
            ref={inputRef}
            type="text"
            value={newChecklistItem}
            onChange={(event) => onChangeNewChecklist(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="새로운 루틴을 추가해보세요"
            className={baseInputStyles}
            data-checklist-input
          />
          <Button
            variant="icon"
            onClick={handleAddButtonClick}
            aria-label="체크리스트 추가"
          >
            <Image
              src="/addloopsheet/addloopsheet_add.svg"
              alt="체크리스트 추가"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
