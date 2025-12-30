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
        <div className="flex items-end justify-between self-stretch">
          <div className="flex flex-col items-start gap-1.5">
            <div className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-600,#737980)]">{formattedDate}</div>
            <h1 className="text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[var(--gray-black,#121212)]">{detail.title}</h1>
          </div>
          <IconButton
            src="/loop/loop_kebab.svg"
            alt="메뉴"
            width={20}
            height={20}
            onClick={onMenuClick}
          />
        </div>
        {/* {detail.content ? (
          <p className="text-sm leading-relaxed text-[#676A79]">
            {detail.content}
          </p>
        ) : null} */}
      </section>

      <section className="flex flex-col items-center gap-6 px-1">
        <LoopProgress progress={detail.progress} />
        <div className="w-full max-w-[420px] space-y-4">
          <Checklist
            checklists={detail.checklists}
            onToggleItem={onToggleChecklist}
            newChecklistContent={newChecklistContent}
            onNewChecklistContentChange={onNewChecklistContentChange}
            onAddChecklist={onAddChecklist}
            key={detail.id}
          />
        </div>
      </section>

      <div className="flex justify-center">
        <button
          className="flex w-full max-w-[420px] h-[48px] rounded-[30px] bg-[var(--primary-500,#FF7765)] px-[121px] py-[15px] justify-center items-center gap-[10px] text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-white,#FFF)]"
          onClick={onCompleteLoop}
        >
          루프 완료하기
        </button>
      </div>

    </>
  );
}

