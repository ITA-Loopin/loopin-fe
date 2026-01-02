import type { TeamItem } from "./types";

type TeamCardProps = {
  team: TeamItem;
  variant: "my" | "recommended";
};

export function TeamCard({ team, variant }: TeamCardProps) {
  if (variant === "my") {
    // 가로 스크롤용 카드 (원형 프로그레스 포함)
    const progress = team.progress ?? 0;
    const radius = 40; // 90x90 원형, 반지름 40 (strokeWidth 6 고려)
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex w-full flex-col items-start gap-[10px] rounded-[10px] bg-white p-4">
        {/* 안 레이아웃 */}
        <div className="flex w-full items-start gap-5">
          {/* 왼쪽 레이아웃 */}
          <div className="flex w-full h-[126px] flex-col items-start justify-between">
            <div>
              <span className="inline-block rounded-[30px] bg-[#FF9A8D] px-[7px] py-[5px] text-[10px] gap-[10px] font-medium leading-[140%] tracking-[-0.2px] text-white">
                {team.category}
              </span>
            </div>
            <div className="flex flex-col items-start self-stretch gap-1">
              <h3 className="text-base font-bold leading-[150%] tracking-[-0.32px] text-[#121212]">
                {team.title}
              </h3>
              <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[#737980]">{team.description}</p>
            </div>
            <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
              {team.startDate} ~ {team.endDate}
            </p>
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
                stroke="#F0F2F3"
                strokeWidth="7"
              />
              {/* 진행률 원 */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="none"
                stroke="#FF7765"
                strokeWidth="7" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold leading-[150%] tracking-[-0.32px] text-[#121212]">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 세로 리스트용 카드 (원형 프로그레스 없음)
  return (
    <div className="flex w-full flex-col items-start gap-[10px] self-stretch rounded-[10px] bg-white px-4 py-2.5">
      {/* 안 레이아웃 */}
      <div className="flex flex-col items-start gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="inline-block rounded-[30px] bg-[#FF9A8D] px-[7px] py-[5px] text-[10px] font-medium leading-[140%] tracking-[-0.2px] text-white">
            {team.category}
          </span>
          <span className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
            {team.startDate} ~ {team.endDate}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <h3 className="text-base font-bold leading-[150%] tracking-[-0.32px] text-[#121212]">
            {team.title}
          </h3>
          <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#737980]">
            {team.description}
          </p>
        </div>
      </div>
    </div>
  );
}

