"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import Header from "@/components/common/Header";
import { AddLoopSheet } from "@/components/common/add-loop/AddLoopSheet";
import { LoopList } from "@/components/home";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { useDailyLoops } from "@/hooks/useDailyLoops";
import { useCalendarLoops } from "@/hooks/useCalendarLoops";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs().startOf("month"));

  const selectedDateKey = useMemo(
    () => selectedDate.format("YYYY-MM-DD"),
    [selectedDate]
  );
  const [refreshKey, setRefreshKey] = useState(0);


  const { loopList, isLoading } = useDailyLoops({
    date: selectedDateKey,
    refreshKey,
  });
  const { loopDays } = useCalendarLoops({
    year: visibleMonth.year(),
    month: visibleMonth.month() + 1, // dayjs month는 0-based이므로 +1
    refreshKey,
  });
  const [isAddLoopModalOpen, setIsAddLoopModalOpen] = useState(false);

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((prev) => prev.add(offset, "month"));
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    // 선택한 날짜가 현재 보이는 달과 다를 때 visibleMonth 업데이트
    if (!date.isSame(visibleMonth, "month")) {
      setVisibleMonth(date.startOf("month"));
    }
  };

  const handleOpenAddLoopModal = () => {
    setIsAddLoopModalOpen(true);
  };

  const handleCloseAddLoopModal = () => {
    setIsAddLoopModalOpen(false);
  };


  const handleAddLoopSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <div className="relative flex flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col items-center gap-4 px-4">
          <div className="flex justify-center w-full">
            <MonthCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
              loopDays={loopDays}
            />
          </div>

          <LoopList
            loops={loopList}
            isLoading={isLoading}
          />
          <PrimaryButton variant="secondary" onClick={handleOpenAddLoopModal}>
            루프 추가하기
          </PrimaryButton>

        </main>
        <AddLoopSheet
          isOpen={isAddLoopModalOpen}
          onClose={handleCloseAddLoopModal}
          defaultValues={{
            startDate: selectedDateKey,
          }}
          onCreated={handleAddLoopSuccess}
        />
      </div>
    </>
  );
}

