export default function CalendarPage() {
  return (
    <section className="flex min-h-[calc(100vh-220px)] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        일정 캘린더가 여기에 표시될 예정입니다. 팀원들과 공유할 일정을
        손쉽게 관리할 수 있도록 준비 중이에요!
      </p>
    </section>
  );
}

