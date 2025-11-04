import type { LoopItem } from "./types";

type LoopListItemProps = {
  item: LoopItem;
};

export function LoopListItem({ item }: LoopListItemProps) {
  const progress = Math.round((item.completed / item.total) * 100);

  return (
    <li className="border rounded-lg px-4 py-3 flex justify-between bg-white">
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-gray-500">
          {item.completed}개 중 {item.total}개 완료
        </p>
      </div>
      <p>{progress}%</p>
    </li>
  );
}

