"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
      <p className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-800,#3A3D40)]">{loop.title}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)]">{loop.schedule}</p>
        <p className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--primary-main,#FF543F)]">
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

const PlusIcon = () => (
  <Image
    src="/analytics/icon_add.png"
    alt="추가"
    width={15}
    height={15}
  />
);

const EditIcon = () => (
  <Image
    src="/analytics/icon_edit.png"
    alt="수정"
    width={15}
    height={15}
  />
);

type SuggestionButtonProps = {
  onActionClick?: () => void;
};

function SuggestionButton({ onActionClick }: SuggestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onActionClick}
      className="flex items-center justify-center gap-2 rounded-[5px] bg-[var(--gray-300,#DDE0E3)] py-1.5 px-2 text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)] transition"
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
    <div className="flex flex-col items-center justify-center gap-[10px]">
      <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[var(--gray-600,#737980)]">루프를 조금 가볍게 만들어볼까요?</p>
      <SuggestionButton onActionClick={onActionClick} />
    </div>
  );
}

type LoopGroupProps = {
  title: string;
  loops: ReportLoopItem[];
  emptyMessage: string;
  showSuggestion?: boolean;
  showAddButton?: boolean;
  onActionClick?: () => void;
  isEmpty: boolean;
  onAddClick?: () => void;
};

function LoopGroup({ title, loops, emptyMessage, showSuggestion, showAddButton, onActionClick, isEmpty, onAddClick }: LoopGroupProps) {
  const shouldShowSuggestion = showSuggestion && !isEmpty;
  const hasLoops = loops.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-black,#121212)]">{title}</h3>
      
      {!hasLoops ? (
        <>
          <div className="flex flex-col items-center justify-center gap-[10px] rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-400,#C6CCD1)]">{emptyMessage}</p>
            {showAddButton && (
              <>
                <div className="w-full border-t border-[#E5E5E5]"></div>
                <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[var(--gray-600,#737980)]">루프를 추가해볼까요?</p>
                <button
                  type="button"
                  onClick={onAddClick}
                  className="flex items-center justify-center gap-2 rounded-[5px] bg-[var(--gray-300,#DDE0E3)] py-1.5 px-2 text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)] transition"
                >
                  <PlusIcon />
                  루프 추가하기
                </button>
              </>
            )}
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
  const router = useRouter();

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
        showAddButton={isEmpty}
        onActionClick={onActionClick}
        onAddClick={() => router.push("/calendar")}
        isEmpty={isEmpty}
      />
    </div>
  );
}

