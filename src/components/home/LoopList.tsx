import type { LoopItem } from "./types";
import { LoopListItem } from "./LoopListItem";

type LoopListProps = {
  loops: LoopItem[];
};

export function LoopList({ loops }: LoopListProps) {
  return (
    <section>
      <h2 className="mb-2 flex items-baseline gap-1 text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[var(--gray-black,#121212)]">
        Loop List <span className="text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)]">· {loops.length}</span>
      </h2>
      <ul className="flex flex-col gap-[10px]">
        {loops.map((item) => (
          <LoopListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

