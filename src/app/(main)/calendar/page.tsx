"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { Dayjs } from "dayjs";
import Header from "@/components/common/Header";
import { AddLoopSheet } from "@/components/common/add-loop/AddLoopSheet";
import { LoopList } from "@/components/home";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { AddLoopButton } from "@/components/calendar/AddLoopButton";
import { useDailyLoops } from "@/hooks/useDailyLoops";
import { cn } from "@/lib/utils";

dayjs.locale("ko");

export default function CalendarPage() {
  const today = useMemo(() => dayjs(), []);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(today);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(today.startOf("month"));

  const selectedDateKey = useMemo(
    () => selectedDate.format("YYYY-MM-DD"),
    [selectedDate]
  );
  const [refreshKey, setRefreshKey] = useState(0);


  const { loopList, isLoading } = useDailyLoops({
    date: selectedDateKey,
    refreshKey,
  });
  const [isAddLoopModalOpen, setIsAddLoopModalOpen] = useState(false);

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((prev) => prev.add(offset, "month"));
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setVisibleMonth(date.startOf("month"));
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
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,228,224,0.35) 100%)",
        }}
      />
      <div className="relative flex flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col items-center gap-4 px-4 pb-8 pt-2">

          <MonthCalendar
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />

          <LoopList
            loops={loopList}
            isLoading={isLoading}
            addButton={<AddLoopButton onClick={handleOpenAddLoopModal} />}
          />
          {loopList.length > 0 && <AddLoopButton onClick={handleOpenAddLoopModal} />}

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

