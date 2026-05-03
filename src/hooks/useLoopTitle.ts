import { useCallback, useEffect, useState } from "react";

interface UseLoopTitleProps {
  isOpen: boolean;
  defaultValue?: string;
}

export function useLoopTitle({ isOpen, defaultValue }: UseLoopTitleProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaultValue ?? "");
  }, [isOpen, defaultValue]);

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
  }, []);

  return {
    title,
    handleTitleChange,
  };
}

