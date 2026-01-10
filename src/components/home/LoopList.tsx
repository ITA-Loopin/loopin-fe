import type { LoopItem } from "./types";
import { LoopListItem } from "./LoopListItem";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LoopListProps = {
  loops: LoopItem[];
  isLoading?: boolean;
  addButton?: ReactNode;
};

export function LoopList({ loops, isLoading = false, addButton }: LoopListProps) {
  return (
    <section
      className={cn(
        "w-full max-w-[420px] transition-opacity duration-300 ease-in-out",
        isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <h2 className="mb-2 flex items-baseline gap-1 text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[var(--gray-black,#121212)]">
        Loop List <span className="text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)]">· {loops.length}</span>
      </h2>
      {loops.length === 0 && addButton ? (
        <div className="mt-6 w-full">{addButton}</div>
      ) : (
        <ul className="flex flex-col gap-[10px]">
          {loops.map((item) => (
            <LoopListItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

