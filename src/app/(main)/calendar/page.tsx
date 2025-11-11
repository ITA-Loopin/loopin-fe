"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiFetch, MissingAccessTokenError } from "@/lib/api";

const daysOfWeekOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function CalendarPage() {
  const today = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scheduleType, setScheduleType] = useState<"NONE" | "WEEKLY" | "MONTHLY" | "YEARLY">("NONE");
  const [specificDate, setSpecificDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [checklists, setChecklists] = useState("");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setResultMessage(null);

    if (!title.trim()) {
      setErrorMessage("제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        scheduleType,
      };

      if (content.trim()) {
        payload.content = content.trim();
      }

      if (scheduleType === "NONE") {
        payload.specificDate = specificDate;
        payload.startDate = startDate || today;
        if (endDate) {
          payload.endDate = endDate;
        }
      } else {
        payload.startDate = startDate || today;
        if (endDate) {
          payload.endDate = endDate;
        }
        if (scheduleType === "WEEKLY" && selectedDays.length > 0) {
          payload.daysOfWeek = selectedDays;
        }
      }

      const checklistItems = checklists
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      if (checklistItems.length > 0) {
        payload.checklists = checklistItems;
      }

      const data = await apiFetch<{
        success?: boolean;
        data?: { id?: string };
      }>("/api-proxy/rest-api/v1/loops", {
        method: "POST",
        json: payload,
      });

      setResultMessage(
        `루프가 생성되었습니다. ID: ${data?.data?.id ?? "확인 필요"}`
      );
      setTitle("");
      setContent("");
      setScheduleType("NONE");
      setSpecificDate(today);
      setStartDate(today);
      setEndDate("");
      setSelectedDays([]);
      setChecklists("");
    } catch (error) {
      console.error("루프 생성 실패", error);
      setErrorMessage(
        error instanceof MissingAccessTokenError
          ? "accessToken이 없습니다. 다시 로그인해주세요."
          : error instanceof Error
            ? error.message
            : "루프 생성 도중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-220px)] flex-col items-center gap-6 px-6 py-10 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          일정 캘린더가 여기에 표시될 예정입니다. 팀원들과 공유할 일정을 손쉽게 관리할 수 있도록 준비 중이에요!
        </p>
      </div>

      <div className="w-full max-w-xl rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-left">
          <h2 className="text-lg font-semibold text-primary">
            개발용 루프 생성 도구
          </h2>
          <p className="mt-1 text-xs text-primary/70">
            내부 테스트 전용입니다. 운영 배포 전에는 반드시 비활성화하거나 제거하세요.
          </p>

          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">제목 *</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="예: 오늘의 루프"
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">내용</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="루프에 대한 설명을 입력하세요"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">날짜</span>
              <input
                type="date"
                value={specificDate}
                onChange={(event) => setSpecificDate(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">반복 방식 *</span>
              <select
                value={scheduleType}
                onChange={(event) => setScheduleType(event.target.value as typeof scheduleType)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="NONE">단일 날짜 (NONE)</option>
                <option value="WEEKLY">주간 반복 (WEEKLY)</option>
                <option value="MONTHLY">월간 반복 (MONTHLY)</option>
                <option value="YEARLY">연간 반복 (YEARLY)</option>
              </select>
            </label>

            {scheduleType === "NONE" && (
              <label className="grid gap-2 text-sm">
                <span className="font-medium">특정 날짜 *</span>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(event) => setSpecificDate(event.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </label>
            )}

            {scheduleType !== "NONE" && scheduleType === "WEEKLY" && (
              <fieldset className="grid gap-2 text-sm">
                <span className="font-medium">반복 요일</span>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeekOptions.map((day: string) => {
                    const checked = selectedDays.includes(day);
                    return (
                      <label
                        key={day}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={checked}
                          onChange={() => {
                            setSelectedDays((prev) =>
                              checked
                                ? prev.filter((value) => value !== day)
                                : [...prev, day]
                            );
                          }}
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-medium">시작일</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">종료일</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">체크리스트 (줄바꿈으로 구분)</span>
              <textarea
                value={checklists}
                onChange={(event) => setChecklists(event.target.value)}
                className="min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={"예:\n아침 루틴\n점심 루틴"}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "생성 중..." : "루프 생성"}
            </button>
          </form>

          {resultMessage && (
            <p className="mt-4 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary-foreground">
              {resultMessage}
            </p>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
    </section>
  );
}

