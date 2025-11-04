import type { LoopItem } from "./types";
import { LoopListItem } from "./LoopListItem";

type LoopListProps = {
  loops: LoopItem[];
};

export function LoopList({ loops }: LoopListProps) {
  return (
    <section>
      <h2 className="font-bold mb-2 text-[20px]">
        Loop List <span className="text-gray-500" style={{ fontSize: "16px" }}>· {loops.length}</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {loops.map((item) => (
          <LoopListItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

