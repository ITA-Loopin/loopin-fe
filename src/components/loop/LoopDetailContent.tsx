import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import { LoopProgress } from "@/components/home/LoopProgress";
import { Checklist } from "@/components/loop/Checklist";
import { IconButton } from "@/components/common/IconButton";

dayjs.locale("ko");

interface LoopDetailContentProps {
  detail: LoopDetail;
  newChecklistContent: string;
  onNewChecklistContentChange: (content: string) => void;
  onToggleChecklist: (item: LoopChecklist) => Promise<void>;
  onAddChecklist: () => Promise<void>;
  onCompleteLoop: () => Promise<void>;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LoopDetailContent({
  detail,
  newChecklistContent,
  onNewChecklistContentChange,
  onToggleChecklist,
  onAddChecklist,
  onCompleteLoop,
  onMenuClick,
}: LoopDetailContentProps) {
  const formattedDate = useMemo(() => {
    if (!detail?.loopDate) {
      return "";
    }
    return dayjs(detail.loopDate).format("YYYY년 M월 D일 dddd");
  }, [detail?.loopDate]);

  return (
    <>
      <section className="flex flex-col gap-2 pt-6">
        <div className="text-sm text-[#8D91A1]">{formattedDate}</div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-[#2C2C2C]">{detail.title}</h1>
          <IconButton
            src="/loop/loop_kebab.svg"
            alt="메뉴"
            width={20}
            height={20}
            onClick={onMenuClick}
          />
        </div>
        {detail.content ? (
          <p className="text-sm leading-relaxed text-[#676A79]">
            {detail.content}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col items-center gap-6 px-1">
        <LoopProgress progress={detail.progress} />
        <div className="w-full max-w-[420px] space-y-4">
          <Checklist
            checklists={detail.checklists}
            onToggleItem={onToggleChecklist}
            key={detail.id}
          />

          <div className="flex h-14 w-full items-center gap-[10px] rounded-[10px] border border-[#E2E4EA] bg-white px-4 transition-colors focus-within:border-[#FF7765]">
            <input
              type="text"
              placeholder="새로운 루틴을 추가해보세요"
              value={newChecklistContent}
              onChange={(event) => onNewChecklistContentChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddChecklist();
                }
              }}
              className="flex-1 border-none bg-transparent text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
            />
            <IconButton
              src="/addloopsheet/addloopsheet_add.svg"
              alt="루틴 추가"
              width={20}
              height={20}
              className="h-5 w-5"
              onClick={onAddChecklist}
            />
          </div>
        </div>
      </section>

      <div className="mt-auto flex flex-col gap-4 pb-8">
        <button
          className="w-full rounded-3xl bg-[#FF7765] px-6 py-4 text-base font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-60"
          onClick={onCompleteLoop}
          disabled={!detail.checklists.length}
        >
          루프 완료하기
        </button>
      </div>
    </>
  );
}

