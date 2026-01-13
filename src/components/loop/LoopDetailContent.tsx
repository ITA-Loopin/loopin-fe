import { useMemo } from "react";
import dayjs from "dayjs";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import { LoopProgress } from "@/components/home/LoopProgress";
import { Checklist } from "@/components/loop/Checklist";
import { IconButton } from "@/components/common/IconButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { DropdownEditDelete } from "@/components/loop/DropdownEditDelete";

interface LoopDetailContentProps {
  detail: LoopDetail;
  newChecklistContent: string;
  onNewChecklistContentChange: (content: string) => void;
  onToggleChecklist: (item: LoopChecklist) => Promise<void>;
  onDeleteChecklist?: (itemId: number) => Promise<void>;
  onAddChecklist: () => Promise<void>;
  onCompleteLoop: () => Promise<void>;
  isCompletingLoop?: boolean;
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
  onDeleteChecklist,
  onAddChecklist,
  onCompleteLoop,
  isCompletingLoop = false,
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
        <div className="flex items-end justify-between self-stretch gap-2">
          <div className="flex flex-col items-start gap-1.5 min-w-0 flex-1">
            <div className="text-body-2-m text-[var(--gray-600)]">{formattedDate}</div>
            <h1 className="text-title-2-b text-[var(--gray-black)] truncate w-full">{detail.title}</h1>
          </div>
          <div className="relative flex-shrink-0">
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
      </section>

      <section className="flex flex-col items-center gap-6 px-1">
        <LoopProgress progress={detail.progress} />
        <div className="w-full space-y-4">
          <Checklist
            checklists={detail.checklists}
            onToggleItem={onToggleChecklist}
            onDeleteItem={onDeleteChecklist}
            newChecklistContent={newChecklistContent}
            onNewChecklistContentChange={onNewChecklistContentChange}
            onAddChecklist={onAddChecklist}
            key={detail.id}
          />
        </div>
      </section>

      <div className="flex justify-center">
        <PrimaryButton
          variant="primary"
          onClick={onCompleteLoop}
          disabled={isCompletingLoop}
        >
          {isCompletingLoop ? "완료 중..." : "루프 완료하기"}
        </PrimaryButton>
      </div>

    </>
  );
}

