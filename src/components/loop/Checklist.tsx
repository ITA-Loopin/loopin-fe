import type { LoopChecklist } from "@/types/loop";
import { ChecklistItem } from "./ChecklistItem";

type ChecklistProps = {
  checklists: LoopChecklist[];
  title?: string;
  onToggleItem?: (item: LoopChecklist) => void;
};

import { useEffect, useState } from "react";

export function Checklist({
  checklists,
  title = "Checklist",
  onToggleItem,
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

  return (
    <section className="w-full">
      <h2 className="mb-2 text-[20px] font-bold text-[#2C2C2C]">
        {title}{" "}
        <span className="text-[16px] text-gray-500">· {items.length}</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={handleToggle} />
        ))}
      </ul>
    </section>
  );
}


