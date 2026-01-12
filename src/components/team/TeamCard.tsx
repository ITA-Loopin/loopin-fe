import { useRouter } from "next/navigation";
import type { TeamItem } from "./types";
import { getTeamCategoryLabel } from "./types";

type TeamCardProps = {
  team: TeamItem;
  variant: "my" | "recruiting";
  onClick?: () => void;
  isEditMode?: boolean;
};

export function TeamCard({ team, variant, onClick, isEditMode = false }: TeamCardProps) {
  const router = useRouter();
  if (variant === "my") {
    // 가로 스크롤용 카드 (원형 프로그레스 포함)
    const progress = team.progress ?? 0;
    const radius = 40; // 90x90 원형, 반지름 40 (strokeWidth 6 고려)
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const handleClick = () => {
      if (isEditMode) return; // 편집 모드일 때는 클릭 비활성화
      if (onClick) {
        onClick();
      } else {
        router.push(`/team/${team.id}`);
      }
    };

    return (
      <div 
        className={`relative flex w-full flex-col items-start gap-[10px] rounded-[10px] bg-[var(--gray-white)] p-4 ${
          !isEditMode ? "cursor-pointer" : ""
        }`}
        onClick={handleClick}
      >
        {/* 안 레이아웃 */}
        <div className="flex w-full items-start gap-5">
          {/* 왼쪽 레이아웃 */}
          <div className="flex w-full flex-col items-start justify-between">
            <div>
              <span className="text-caption-10-m rounded-[30px] bg-[var(--primary-400)] px-[7px] py-[5px] gap-[10px] text-[var(--gray-white)]">
                {getTeamCategoryLabel(team.category)}
              </span>
            </div>
            <div className="flex flex-col items-start self-stretch gap-1 pt-2">
              <h3 className="text-body-1-b text-[var(--gray-black)]">
                {team.title}
              </h3>
              <p className="text-body-2-m text-[var(--gray-600)]">{team.description}</p>
            </div>
          </div>

          {/* 오른쪽 레이아웃 - 90x90 원형 진행률 */}
          <div className="relative h-[90px] w-[90px] shrink-0">
            <svg className="h-[90px] w-[90px] -rotate-90">
              {/* 배경 원 */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="none"
                stroke="var(--gray-200)"
                strokeWidth="6.5"
              />
              {/* 진행률 원 */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="none"
                stroke="var(--primary-500)"
                strokeWidth="7" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-body-1-b text-[var(--gray-black)]">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 세로 리스트용 카드 (원형 프로그레스 없음)
  return (
    <div className="flex w-full flex-col items-start gap-[10px] self-stretch rounded-[10px] bg-[var(--gray-white)] px-4 py-2.5">
      {/* 안 레이아웃 */}
      <div className="flex flex-col items-start gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-caption-10-m rounded-[30px] bg-[var(--primary-400)] px-[7px] py-[5px] text-[var(--gray-white)]">
            {getTeamCategoryLabel(team.category)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <h3 className="text-body-1-b text-[var(--gray-black)]">
            {team.title}
          </h3>
          <p className="text-body-2-m text-[var(--gray-600)]">
            {team.description}
          </p>
        </div>
      </div>
    </div>
  );
}

