"use client";

import { FormEvent, useEffect, useState } from "react";
import dayjs from "dayjs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { cn } from "@/lib/utils";

const REPEAT_OPTIONS = [
  { label: "매주", value: "WEEKLY" },
  { label: "매달", value: "MONTHLY" },
  { label: "매년", value: "YEARLY" },
  { label: "안함", value: "NONE" },
];

type ChecklistItem = {
  id: string;
  text: string;
};

type AddLoopModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** ✅ 외부에서 초기값을 주입할 수 있게 함 (AI 추천 값도 여기에 들어감) */
  defaultValues?: {
    loopName?: string;
    repeatOption?: string;
    startDate?: string;
    endDate?: string;
    checklistItems?: ChecklistItem[];
  };
};

export function AddLoopModal({ isOpen, onClose, defaultValues }: AddLoopModalProps) {
  const [loopName, setLoopName] = useState("");
  const [repeatOption, setRepeatOption] = useState("WEEKLY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklist, setNewChecklist] = useState("");

  /** ✅ 모달이 열릴 때만 값 초기화 (AI 추천값 or 초기값 반영) */
  useEffect(() => {
    if (!isOpen) return;

    setLoopName(defaultValues?.loopName ?? "");
    setRepeatOption(defaultValues?.repeatOption ?? "");
    setStartDate(defaultValues?.startDate ?? dayjs().format("YYYY-MM-DD"));
    setEndDate(defaultValues?.endDate ?? "");
    setChecklistItems(defaultValues?.checklistItems ?? [
      { id: "checklist-1", text: "요가 1시간" },
    ]);
    setNewChecklist("");
  }, [isOpen, defaultValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: API 연결 시 여기서 값 서버로 전송
    onClose();
  };

  const handleAddChecklist = () => {
    const trimmed = newChecklist.trim();
    if (!trimmed) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `checklist-${prev.length + 1}`, text: trimmed },
    ]);
    setNewChecklist("");
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 추가하기"
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">루프 추가하기</h2>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {/* ✅ 루프 이름 */}
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[#676A79]">루프 이름</span>
          <input
            type="text"
            value={loopName}
            onChange={(e) => setLoopName(e.target.value)}
            placeholder="루프의 이름을 적어주세요"
            className="rounded-2xl border border-[#F0F0F3] bg-[#F9FAFB] px-4 py-3"
          />
        </label>

        {/* ✅ 반복 주기 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">반복 주기</p>
          <div className="grid grid-cols-2 gap-2">
            {REPEAT_OPTIONS.map((option) => {
              const isActive = repeatOption === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRepeatOption(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                      : "border-[#F0F0F3] bg-white text-[#8D91A1]"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ 날짜 선택 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">반복 기간</p>
          <div className="space-y-2">
            {/* 시작일 */}
            <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
              <span className="text-[#8D91A1]">시작일</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-right"
              />
            </div>
            {/* 종료일 */}
            <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
              <span className="text-[#8D91A1]">종료일</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-right"
              />
            </div>
          </div>
        </div>

        {/* ✅ 체크리스트 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">체크리스트</p>
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border bg-[#FFF7F5] px-4 py-3"
            >
              <span>{item.text}</span>
              <button
                type="button"
                onClick={() => handleRemoveChecklist(item.id)}
                className="text-[#FF7765]"
              >
                ×
              </button>
            </div>
          ))}

          {/* 체크리스트 추가 입력 */}
          <div className="flex items-center gap-2 rounded-2xl border-dashed border px-4 py-3">
            <input
              type="text"
              value={newChecklist}
              onChange={(e) => setNewChecklist(e.target.value)}
              placeholder="새로운 루틴을 추가해보세요"
              className="flex-1 bg-transparent"
            />
            <button
              type="button"
              onClick={handleAddChecklist}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7765] text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* ✅ 제출 버튼 */}
        <button
          type="submit"
          className="w-full rounded-[24px] bg-[#2C2C2C] px-6 py-4 text-base font-semibold text-white"
        >
          루프 추가하기
        </button>
      </form>
    </BottomSheet>
  );
}
