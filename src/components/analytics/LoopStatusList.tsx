"use client";

import type { ReportLoopItem, ReportStatus } from "@/types/report";

type CalendarViewType = "week" | "month";

type LoopStatusListProps = {
  viewType: CalendarViewType;
  stableLoops: ReportLoopItem[];
  unstableLoops: ReportLoopItem[];
  status: ReportStatus;
  goodProgressMessage: string | null;
  badProgressMessage: string | null;
  onActionClick?: () => void;
};

type LoopItemCardProps = {
  loop: ReportLoopItem;
  variant?: "default" | "inline";
};

function LoopItemCard({ loop, variant = "default" }: LoopItemCardProps) {
  const content = (
    <>
      <p className="text-sm font-medium text-[#2C2C2C]">{loop.title}</p>
      <div className="flex items-center gap-2">
        <p className="text-xs text-[#8F8A87]">{loop.schedule}</p>
        <p
          className={`text-sm font-semibold ${
            loop.completionRate > 0 ? "text-[#FF543F]" : "text-[#8F8A87]"
          }`}
        >
          {loop.completionRate}%
        </p>
      </div>
    </>
  );

  if (variant === "inline") {
    return <div className="flex items-center justify-between">{content}</div>;
  }

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">{content}</div>
    </div>
  );
}

const EditIcon = ({ fill = "#FF543F" }: { fill?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3333 1.99998C11.5084 1.82487 11.7163 1.68698 11.9441 1.59431C12.1719 1.50164 12.4151 1.45605 12.66 1.46031C12.9049 1.46457 13.1464 1.51858 13.3707 1.61898C13.595 1.71938 13.7978 1.86408 13.9671 2.04431C14.1364 2.22454 14.2687 2.43669 14.3568 2.66845C14.4449 2.90021 14.4869 3.14699 14.4804 3.39465C14.4739 3.64231 14.419 3.88599 14.3187 4.11131C14.2184 4.33663 14.0747 4.53899 13.8953 4.70665L12.8333 5.76865L10.2313 3.16665L11.2933 2.10465L11.3333 1.99998ZM9.77133 3.62665L12.3733 6.22865L5.66666 12.9353L3.06466 10.3333L9.77133 3.62665ZM2.33333 13.3333H5.33333L13.6667 5L10.6667 2L2.33333 10.3333V13.3333Z"
      fill={fill}
    />
  </svg>
);

type SuggestionButtonProps = {
  onActionClick?: () => void;
};

function SuggestionButton({ onActionClick }: SuggestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onActionClick}
      className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#FF543F] bg-white px-4 py-2 text-sm font-semibold text-[#FF543F] transition hover:bg-[#FFF5F3]"
    >
      <EditIcon />
      루프 수정하기
    </button>
  );
}

type LoopSuggestionCardProps = {
  onActionClick?: () => void;
};

function LoopSuggestionCard({ onActionClick }: LoopSuggestionCardProps) {
  return (
    <>
      <p className="mb-2 text-sm text-[#2C2C2C]">루프를 조금 가볍게 만들어볼까요?</p>
      <SuggestionButton onActionClick={onActionClick} />
    </>
  );
}

type LoopGroupProps = {
  title: string;
  loops: ReportLoopItem[];
  emptyMessage: string;
  showSuggestion?: boolean;
  onActionClick?: () => void;
  isEmpty: boolean;
};

function LoopGroup({ title, loops, emptyMessage, showSuggestion, onActionClick, isEmpty }: LoopGroupProps) {
  const shouldShowSuggestion = showSuggestion && !isEmpty;
  const hasLoops = loops.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-black,#121212)]">{title}</h3>
      
      {!hasLoops ? (
        <>
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-left text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-400,#C6CCD1)]">{emptyMessage}</p>
          </div>
          {shouldShowSuggestion && (
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
              <LoopSuggestionCard onActionClick={onActionClick} />
            </div>
          )}
        </>
      ) : shouldShowSuggestion ? (
        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
          <div className="space-y-3">
            {loops.map((loop) => (
              <LoopItemCard key={loop.id} loop={loop} variant="inline" />
            ))}
          </div>
          <div className="mt-3 border-t border-[#E5E5E5] pt-3">
            <LoopSuggestionCard onActionClick={onActionClick} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {loops.map((loop) => (
            <LoopItemCard key={loop.id} loop={loop} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LoopStatusList({
  viewType,
  stableLoops,
  unstableLoops,
  status,
  goodProgressMessage,
  badProgressMessage,
  onActionClick,
}: LoopStatusListProps) {
  const periodText = viewType === "week" ? "이번주" : "이번달";
  const isEmpty = status === "NONE";

  return (
    <div className="space-y-6 -mx-6 px-10 w-[calc(100%+48px)]">
      <LoopGroup
        title={`${periodText} 안정적으로 이어진 루프예요`}
        loops={stableLoops}
        emptyMessage={goodProgressMessage || "이번 주에는 완성된 루프가 없었어요"}
        isEmpty={isEmpty}
      />
      <LoopGroup
        title={`${periodText} 잘 이어지지 않았던 루프예요`}
        loops={unstableLoops}
        emptyMessage={badProgressMessage || "아직 평가할 수 있는 반복 루프가 없어요"}
        showSuggestion
        onActionClick={onActionClick}
        isEmpty={isEmpty}
      />
    </div>
  );
}

