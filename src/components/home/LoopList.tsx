import type { LoopItem } from "./types";
import { LoopListItem } from "./LoopListItem";

type LoopListProps = {
  loops: LoopItem[];
};

export function LoopList({ loops }: LoopListProps) {
  return (
    <section>
      <h2 className="font-bold mb-2">Loop List · {loops.length}</h2>
      <ul className="flex flex-col gap-2">
        {loops.map((item) => (
          <LoopListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

