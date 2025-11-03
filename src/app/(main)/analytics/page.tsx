export default function AnalyticsPage() {
  return (
    <section className="flex min-h-[calc(100vh-220px)] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Report</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        활동 리포트와 성과 분석을 확인할 수 있는 화면입니다. 데이터가 준비되면
        여기에서 한눈에 살펴보세요.
      </p>
    </section>
  );
}
