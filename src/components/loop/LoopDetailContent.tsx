import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import { LoopProgress } from "@/components/home/LoopProgress";
import { Checklist } from "@/components/loop/Checklist";
import { IconButton } from "@/components/common/IconButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { DropdownEditDelete } from "@/components/loop/DropdownEditDelete";

dayjs.locale("ko");

interface LoopDetailContentProps {
  detail: LoopDetail;
  newChecklistContent: string;
  onNewChecklistContentChange: (content: string) => void;
  onToggleChecklist: (item: LoopChecklist) => Promise<void>;
  onAddChecklist: () => Promise<void>;
  onCompleteLoop: () => Promise<void>;
  isMenuOpen: boolean;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LoopDetailContent({
  detail,
  newChecklistContent,
  onNewChecklistContentChange,
  onToggleChecklist,
  onAddChecklist,
  onCompleteLoop,
  isMenuOpen,
  onMenuClick,
  onMenuClose,
  onEdit,
  onDelete,
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
          <div className="relative">
            <IconButton
              src="/loop/loop_kebab.svg"
              alt="메뉴"
              width={20}
              height={20}
              onClick={onMenuClick}
            />
            {isMenuOpen && (
              <DropdownEditDelete
                onClose={onMenuClose}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
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
        <PrimaryButton variant="primary" onClick={onCompleteLoop}>
          루프 완료하기
        </PrimaryButton>
      </div>

    </>
  );
}

