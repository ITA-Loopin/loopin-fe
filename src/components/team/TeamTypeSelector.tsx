import { cn } from "@/lib/utils";
import type { TeamCategoryString } from "./types";
import { getTeamCategoryLabel, TEAM_CATEGORIES } from "./types";

type TeamTypeSelectorProps = {
  selectedCategory: TeamCategoryString;
  onSelectCategory: (category: TeamCategoryString) => void;
};

export function TeamTypeSelector({
  selectedCategory,
  onSelectCategory,
}: TeamTypeSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">
        팀 유형
      </p>
      <div className="flex w-full self-stretch items-center gap-[10px] flex-wrap">
        {TEAM_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={cn(
                "flex items-center justify-center gap-[16px] rounded-[42.105px] px-3 py-[6px] text-body-2-sb font-semibold transition-colors whitespace-nowrap flex-[0_0_calc((100%-30px)/4)]",
                isSelected
                  ? "bg-[var(--primary-500)] text-[var(--gray-white)]"
                  : "bg-[var(--gray-200)] text-[var(--gray-400)]"
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

