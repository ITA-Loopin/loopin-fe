"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { IconButton } from "@/components/common/IconButton";
import { LoopProgress } from "@/components/home/LoopProgress";
import { fetchTeamLoopMemberChecklist } from "@/lib/team";

type MemberProgressModalProps = {
  isOpen: boolean;
  loopId: number;
  memberId: number;
  memberNickname: string;
  onClose: () => void;
};

export function MemberProgressModal({
  isOpen,
  loopId,
  memberId,
  memberNickname,
  onClose,
}: MemberProgressModalProps) {
  const [checklists, setChecklists] = useState<Array<{
    id: number;
    content: string;
    isChecked: boolean;
  }>>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !loopId || !memberId) {
      return;
    }

    const loadMemberChecklist = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTeamLoopMemberChecklist(loopId, memberId);
        
        setChecklists(data.checklists);
        // 진행률 계산 (실제 체크리스트 완료 상태 기반)
        const total = data.checklists.length;
        const completed = data.checklists.filter((item) => item.isChecked).length;
        const calculatedProgress = total > 0
          ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
          : 0;
        setProgress(calculatedProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "체크리스트를 불러오지 못했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberChecklist();
  }, [isOpen, loopId, memberId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-[420px] rounded-[15px] bg-white p-6">
        {/* 닫기 버튼 */}
        <IconButton
          src="/loop/loop_delete.png"
          alt="닫기"
          width={20}
          height={20}
          onClick={onClose}
          className="absolute right-6 top-6"
        />

        <div className="flex flex-col items-center gap-6">
          {/* 제목 */}
          <h2 className="text-title-2-b text-[var(--gray-black)]">{memberNickname}</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-body-2-m text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* 진행률 */}
              <LoopProgress progress={progress} />

              {/* 체크리스트 */}
              <div className="w-full">
                <h3 className="mb-4 text-title-2-b text-[var(--gray-black)]">
                  Checklist
                  <span className="text-center text-body-2-sb font-semibold text-[var(--gray-600)]">
                    {" "}· {checklists.length}
                  </span>
                </h3>

                <ul className="flex flex-col gap-[10px]">
                  {checklists.map((item) => (
                    <li
                      key={item.id}
                      className="flex w-full items-center justify-between rounded-[10px] p-4 bg-[var(--gray-white)]"
                    >
                      <span className="text-body-1-sb font-semibold text-[var(--gray-800)]">
                        {item.content}
                      </span>
                      <div className="flex-shrink-0 ml-4">
                        {item.isChecked ? (
                          <IconButton
                            src="/loop/loop_btn_complete.svg"
                            alt="완료됨"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                            imageClassName="h-6 w-6"
                          />
                        ) : (
                          <IconButton
                            src="/loop/loop_btn.svg"
                            alt="미완료"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                            imageClassName="h-6 w-6"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
