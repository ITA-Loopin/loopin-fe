import { cn } from "@/lib/utils";
import type { TeamCategoryString } from "./types";
import { getTeamCategoryLabel, TEAM_CATEGORY_LABELS } from "./types";

type TeamTypeSelectorProps = {
  selectedCategory: TeamCategoryString;
  onSelectCategory: (category: TeamCategoryString) => void;
};

const TEAM_CATEGORIES: TeamCategoryString[] = [
  "PROJECT",
  "CONTEST",
  "STUDY",
  "ROUTINE",
  "ETC",
];

export function TeamTypeSelector({
  selectedCategory,
  onSelectCategory,
}: TeamTypeSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
        팀 유형
      </p>
      <div className="flex w-full self-stretch items-center gap-[10px]">
        {TEAM_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={cn(
                "flex items-center justify-center gap-[16px] rounded-[42.105px] px-3 py-[6px] text-sm font-semibold leading-[150%] tracking-[-0.28px] transition-colors whitespace-nowrap",
                isSelected
                  ? "bg-[#FF7765] text-[#FFF]"
                  : "bg-[#F0F2F3] text-[#C6CCD1]"
              )}
            >
              {getTeamCategoryLabel(category)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

