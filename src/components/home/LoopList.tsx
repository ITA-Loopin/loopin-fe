import type { LoopItem } from "./types";
import { LoopListItem } from "./LoopListItem";
import { cn } from "@/lib/utils";

type LoopListProps = {
  loops: LoopItem[];
  isLoading?: boolean;
};

export function LoopList({ loops, isLoading = false }: LoopListProps) {
  return (
    <section
      className={cn(
        "w-full transition-opacity duration-300 ease-in-out",
        isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
    >
      <h2 className="flex items-baseline gap-1 text-title-2-b text-[var(--gray-black)]">
        Loop List <span className="text-body-2-sb text-[var(--gray-600)]">· {loops.length}</span>
      </h2>
      
      <ul className="flex flex-col gap-[10px] mt-4">
        {loops.map((item) => (
          <LoopListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

