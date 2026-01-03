import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";
import { Checklist } from "./constants";

type ChecklistEditorProps = {
  checklists: Checklist[];
  onChangeChecklist: (index: number, text: string) => void;
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
  const itemContainerStyles =
    "flex w-full items-start justify-between rounded-[10px] bg-[#F8F8F9] p-4";
  const baseInputStyles =
    "flex-1 border-none bg-transparent px-0 py-0 text-base font-semibold leading-[150%] tracking-[-0.32px] focus:outline-none focus:ring-0";

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
        체크리스트
      </p>

      <div className="flex w-full flex-col items-start gap-[10px]">
        {checklists.map((item, index) => (
          <div key={item.id} className={itemContainerStyles}>
            <input
              type="text"
              value={item.text}
              onChange={(event) => onChangeChecklist(index, event.target.value)}
              className={cn(
                baseInputStyles,
                "text-[#3A3D40] placeholder:text-[#B7BAC7]"
              )}
            />
            <IconButton
              src="/addloopsheet/addloopsheet_delete.svg"
              alt="체크리스트 삭제"
              width={24}
              height={24}
              onClick={() => onRemoveChecklist(item.id)}
              className="h-6 w-6"
            />
          </div>
        ))}

        <div className={itemContainerStyles}>
          <input
            type="text"
            value={newChecklistItem}
            onChange={(event) => onChangeNewChecklist(event.target.value)}
            placeholder="새로운 루틴을 추가해보세요"
            className={cn(
              baseInputStyles,
              "text-[#2C2C2C] placeholder:text-[#C6CCD1]"
            )}
          />
          <IconButton
            src="/addloopsheet/addloopsheet_add.svg"
            alt="체크리스트 추가"
            width={24}
            height={24}
            onClick={onAddChecklist}
            className="h-6 w-6"
          />
        </div>
      </div>
    </div>
  );
}
