import { useCallback, useEffect, useState } from "react";
import { Checklist } from "@/components/common/add-loop/constants";

interface UseLoopChecklistProps {
  isOpen: boolean;
  defaultChecklists?: Checklist[];
}

interface ChecklistChangeHandler {
  (index: number, text: string): void;
}

export function useLoopChecklist({ isOpen, defaultChecklists }: UseLoopChecklistProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setChecklists(defaultChecklists ?? []);
    setNewChecklistItem("");
  }, [isOpen, defaultChecklists]);

  const handleAddChecklist = useCallback(() => {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    setChecklists((prev) => [...prev, { id: `check-${prev.length + 1}`, text: trimmed }]);
    setNewChecklistItem("");
  }, [newChecklistItem]);

  const handleChecklistChange: ChecklistChangeHandler = useCallback((index, text) => {
    setChecklists((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  }, []);

  const handleRemoveChecklist = useCallback((id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleNewChecklistChange = useCallback((value: string) => {
    setNewChecklistItem(value);
  }, []);

  return {
    checklists,
    newChecklistItem,
    handleAddChecklist,
    handleChecklistChange,
    handleRemoveChecklist,
    handleNewChecklistChange,
  };
}

