"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import type { Dayjs } from "dayjs";
import { HomeHeader, LoopList, EmptyLoopView } from "@/components/home";
import { MonthCalendar, AddLoopButton } from "@/components/calendar";
import { useDailyLoops } from "@/hooks/useDailyLoops";

dayjs.locale("ko");

export default function CalendarPage() {
  const today = useMemo(() => dayjs(), []);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(today);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(today.startOf("month"));

  const selectedDateKey = useMemo(
    () => selectedDate.format("YYYY-MM-DD"),
    [selectedDate]
  );
  const { loopList, isLoading } = useDailyLoops({ date: selectedDateKey });
  const hasLoops = loopList.length > 0;

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((prev) => prev.add(offset, "month"));
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setVisibleMonth(date.startOf("month"));
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
        <HomeHeader />
        <main className="flex w-full flex-1 flex-col items-center gap-6 px-4 pb-32 pt-2">

          <MonthCalendar
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />

          <div className="w-full max-w-[420px]">
            {isLoading ? (
              <div className="rounded-[24px] bg-white/90 px-6 py-10 text-center text-sm text-gray-500 shadow-[0px_12px_32px_rgba(0,0,0,0.06)]">
                로딩 중...
              </div>
            ) : hasLoops ? (
              <LoopList loops={loopList} />
            ) : (
            <div>
              <h2 className="font-semibold text-lg">Loop List · 0</h2>
            </div>
            )}
          </div>

          <AddLoopButton />
        </main>
      </div>
    </>
  );
}


