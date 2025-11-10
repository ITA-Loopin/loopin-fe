"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { Dayjs } from "dayjs";
import Header from "@/components/common/Header";
import { AddLoopSheet } from "@/components/common/add-loop/AddLoopSheet";
import { LoopList } from "@/components/home";
import { MonthCalendar, AddLoopButton} from "@/components/calendar";
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
  const hasLoops = loopList.length > 0;
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
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col items-center gap-6 px-4 pb-32 pt-2">

          <MonthCalendar
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />

          <div className="w-full max-w-[420px]">
            <div
              className={cn(
                "min-h-[184px] transition-opacity duration-300 ease-in-out",
                isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              {hasLoops ? (
                <LoopList loops={loopList} />
              ) : (
                <div>
                  <h2 className="font-semibold text-lg">Loop List · 0</h2>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-[420px]">
            <AddLoopButton onClick={handleOpenAddLoopModal} />
          </div>
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


