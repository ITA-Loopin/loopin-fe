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

type AddLoopModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
};

type ChecklistItem = {
  id: string;
  text: string;
};

export function AddLoopModal({ isOpen, onClose, defaultDate }: AddLoopModalProps) {
  const [loopName, setLoopName] = useState("");
  const [repeatOption, setRepeatOption] = useState("WEEKLY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklist, setNewChecklist] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const baseDate = defaultDate ?? dayjs().format("YYYY-MM-DD");
    setLoopName("");
    setRepeatOption("WEEKLY");
    setStartDate(baseDate);
    setEndDate("");
    setChecklistItems([
      {
        id: "checklist-1",
        text: "요가 1시간",
      },
    ]);
    setNewChecklist("");
  }, [isOpen, defaultDate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: API 연동 시 여기에 등록 로직 추가
    onClose();
  };

  const handleAddChecklist = () => {
    const trimmed = newChecklist.trim();
    if (!trimmed) {
      return;
    }

    setChecklistItems((prev) => [
      ...prev,
      {
        id: `checklist-${prev.length + 1}`,
        text: trimmed,
      },
    ]);
    setNewChecklist("");
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[90vh] overflow-y-auto px-6 pb-8 pt-4">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">루프 추가하기</h2>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[#676A79]">루프 이름</span>
          <input
            type="text"
            value={loopName}
            onChange={(event) => setLoopName(event.target.value)}
            placeholder="루프의 이름을 적어주세요"
            className="rounded-2xl border border-[#F0F0F3] bg-[#F9FAFB] px-4 py-3 text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-2 focus:ring-[#FFADA1]"
          />
        </label>

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
                      : "border-[#F0F0F3] bg-white text-[#8D91A1] hover:border-[#FFADA1]/70"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">반복 기간</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-2xl border border-[#F0F0F3] bg-white px-4 py-3 text-sm text-[#2C2C2C]">
              <span className="font-medium text-[#8D91A1]">시작일</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-auto border-none bg-transparent text-right text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[#F0F0F3] bg-white px-4 py-3 text-sm text-[#2C2C2C]">
              <span className="font-medium text-[#8D91A1]">종료일</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-auto border-none bg-transparent text-right text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">체크리스트</p>
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-[#FFE1DC] bg-[#FFF7F5] px-4 py-3 text-sm text-[#2C2C2C]"
              >
                <span>{item.text}</span>
                <button
                  type="button"
                  aria-label="체크리스트 삭제"
                  onClick={() => handleRemoveChecklist(item.id)}
                  className="text-[#FF7765]"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#FFADA1] bg-white px-4 py-3">
              <input
                type="text"
                value={newChecklist}
                onChange={(event) => setNewChecklist(event.target.value)}
                placeholder="새로운 루틴을 추가해보세요"
                className="flex-1 border-none bg-transparent text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7765] text-lg font-semibold text-white"
                aria-label="체크리스트 추가"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-[24px] bg-[#2C2C2C] px-6 py-4 text-base font-semibold text-white shadow-[0px_18px_36px_rgba(0,0,0,0.15)]"
        >
          루프 추가하기
        </button>
      </form>
    </BottomSheet>
  );
}
