import { IconButton } from "@/components/common/IconButton";
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
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#676A79]">체크리스트</p>

      {checklists.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-2xl border bg-[#FFF7F5] px-4 py-3"
        >
          <input
            type="text"
            value={item.text}
            onChange={(event) => onChangeChecklist(index, event.target.value)}
            className="flex-1 border-none bg-transparent px-0 py-0 text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
          />
          <IconButton
            src="/addloopsheet/addloopsheet_delete.svg"
            alt="체크리스트 삭제"
            width={20}
            height={20}
            onClick={() => onRemoveChecklist(item.id)}
            className="text-[#FF7765]"
          />
        </div>
      ))}

      <div className="flex items-center gap-2 rounded-2xl border border-dashed px-4 py-3">
        <input
          type="text"
          value={newChecklistItem}
          onChange={(event) => onChangeNewChecklist(event.target.value)}
          placeholder="새로운 루틴을 추가해보세요"
          className="flex-1 border-none bg-transparent px-0 py-0 text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
        />
        <IconButton
          src="/addloopsheet/addloopsheet_add.svg"
          alt="체크리스트 추가"
          width={20}
          height={20}
          onClick={onAddChecklist}
          imageClassName="text-white"
        />
      </div>
    </div>
  );
}


