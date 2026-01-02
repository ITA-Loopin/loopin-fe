import type { TeamItem } from "./types";

type TeamCardProps = {
  team: TeamItem;
  variant: "my" | "recommended";
};

export function TeamCard({ team, variant }: TeamCardProps) {
  if (variant === "my") {
    // 가로 스크롤용 카드 (원형 프로그레스 포함)
    const progress = team.progress ?? 0;
    const radius = 28; // 이미지 기준으로 더 큰 원
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex w-[280px] shrink-0 flex-col rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3">
          <span className="inline-block rounded-md bg-[#FFE4E0] px-2 py-1 text-xs font-medium text-[#FF543F]">
            {team.category}
          </span>
        </div>
        <h3 className="mb-1 text-base font-semibold text-[#3A3D40]">
          {team.title}
        </h3>
        <p className="mb-2 text-sm text-[#737980]">{team.description}</p>
        <p className="mb-4 text-xs text-[#A0A9B1]">
          {team.startDate} ~ {team.endDate}
        </p>
        <div className="flex items-center justify-end">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90">
              {/* 배경 원 */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="#F0F2F3"
                strokeWidth="6"
              />
              {/* 진행률 원 */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="#FF543F"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#3A3D40]">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 세로 리스트용 카드 (원형 프로그레스 없음)
  return (
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-block rounded-md bg-[#FFE4E0] px-2 py-1 text-xs font-medium text-[#FF543F]">
          {team.category}
        </span>
        <span className="text-xs text-[#A0A9B1]">
          {team.startDate} ~ {team.endDate}
        </span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-[#3A3D40]">
        {team.title}
      </h3>
      <p className="text-sm text-[#737980]">{team.description}</p>
    </div>
  );
}

