import { useCallback, useState } from "react";

type BaseChecklist = {
  id: string;
  text: string;
};

type UseEditChecklistReturn<T extends BaseChecklist> = {
  checklists: T[];
  setChecklists: React.Dispatch<React.SetStateAction<T[]>>;
  newChecklistItem: string;
  setNewChecklistItem: React.Dispatch<React.SetStateAction<string>>;
  handleAddChecklist: (createNewItem: (id: string, text: string) => T) => void;
  handleChecklistChange: (id: string, text: string) => void;
  handleRemoveChecklist: (id: string) => void;
};

export function useEditChecklist<T extends BaseChecklist>(): UseEditChecklistReturn<T> {
  const [checklists, setChecklists] = useState<T[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleAddChecklist = useCallback(
    (createNewItem: (id: string, text: string) => T) => {
      const trimmed = newChecklistItem.trim();
      if (!trimmed) return;
      setChecklists((prev) => [
        ...prev,
        createNewItem(`temp-${Date.now()}`, trimmed),
      ]);
      setNewChecklistItem("");
    },
    [newChecklistItem]
  );

  const handleChecklistChange = useCallback((id: string, text: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  }, []);

  const handleRemoveChecklist = useCallback((id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    checklists,
    setChecklists,
    newChecklistItem,
    setNewChecklistItem,
    handleAddChecklist,
    handleChecklistChange,
    handleRemoveChecklist,
  };
}

