"use client";

import Image from "next/image";
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
  onAddClick?: () => void;
};

type LoopItemCardProps = {
  loop: ReportLoopItem;
  variant?: "default" | "inline";
  opacity?: number;
};

function LoopItemCard({ loop, variant = "default", opacity = 100 }: LoopItemCardProps) {
  const content = (
    <>
      <p className="text-body-1-sb text-[var(--gray-800)]">{loop.title}</p>
      <div className="flex items-center gap-2">
        <p className="text-body-2-m text-[var(--gray-600)]">{loop.schedule}</p>
        <p className="text-body-2-b text-[var(--primary-main)]">
          {loop.completionRate}%
        </p>
      </div>
    </>
  );

  if (variant === "inline") {
    return <div className="flex items-center justify-between">{content}</div>;
  }

  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
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
      className="flex items-center justify-center gap-2 rounded-[5px] bg-[var(--gray-200)] py-1.5 px-2 text-body-2-m text-[var(--gray-600)] transition"
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
      <p className="text-caption-r text-[var(--gray-600)]">루프를 조금 가볍게 만들어볼까요?</p>
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
  opacity?: number;
};

function LoopGroup({ title, loops, emptyMessage, showSuggestion, showAddButton, onActionClick, isEmpty, onAddClick, opacity = 100 }: LoopGroupProps) {
  const shouldShowSuggestion = showSuggestion && !isEmpty;
  const hasLoops = loops.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-body-1-sb text-[var(--gray-800)]">{title}</h3>
      
      {!hasLoops ? (
        <>
          <div className="flex flex-col items-start gap-[10px] rounded-xl px-4 py-3" style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
            <p className="text-body-1-sb text-[var(--gray-400)] text-left">{emptyMessage}</p>
            {showAddButton && (
              <>
                <div className="w-full border-t border-[var(--gray-200)]"></div>
                <div className="flex w-full flex-col items-center gap-[10px]">
                  <p className="text-caption-r text-[var(--gray-600)] text-center">루프를 추가해볼까요?</p>
                  <button
                    type="button"
                    onClick={onAddClick}
                    className="flex items-center justify-center gap-2 rounded-[5px] bg-[var(--gray-200)] py-1.5 px-2 text-body-2-sb text-[var(--gray-600)] transition"
                  >
                    <PlusIcon />
                    루프 추가하기
                  </button>
                </div>
              </>
            )}
          </div>
          {shouldShowSuggestion && (
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
              <LoopSuggestionCard onActionClick={onActionClick} />
            </div>
          )}
        </>
      ) : shouldShowSuggestion ? (
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
          <div className="space-y-3">
            {loops.map((loop) => (
              <LoopItemCard key={loop.id} loop={loop} variant="inline" opacity={opacity} />
            ))}
          </div>
          <div className="mt-3 border-t border-[var(--gray-200)] pt-3">
            <LoopSuggestionCard onActionClick={onActionClick} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {loops.map((loop) => (
            <LoopItemCard key={loop.id} loop={loop} opacity={opacity} />
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
  onAddClick,
}: LoopStatusListProps) {
  const periodText = viewType === "week" ? "이번주" : "이번달";
  const isEmpty = status === "NONE";

  const getOpacity = () => {
    switch (status) {
      case "NONE":
        return 100;
      case "HARD":
        return 70;
      case "OK":
        return 50;
      case "GOOD":
        return 50;
      default:
        return 100;
    }
  };

  const opacity = getOpacity();

  return (
    <div className="space-y-6 -mx-6 px-10 w-[calc(100%+48px)]">
      <LoopGroup
        title={`${periodText} 안정적으로 이어진 루프예요`}
        loops={stableLoops}
        emptyMessage={goodProgressMessage || "이번 주에는 완성된 루프가 없었어요"}
        isEmpty={isEmpty}
        opacity={opacity}
      />
      <LoopGroup
        title={`${periodText} 잘 이어지지 않았던 루프예요`}
        loops={unstableLoops}
        emptyMessage={badProgressMessage || "아직 평가할 수 있는 반복 루프가 없어요"}
        showSuggestion
        showAddButton={isEmpty}
        onActionClick={onActionClick}
        onAddClick={onAddClick}
        isEmpty={isEmpty}
        opacity={opacity}
      />
    </div>
  );
}

