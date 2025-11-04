type TodayLoopTitleProps = {
  dateText: string;
};

export function TodayLoopTitle({ dateText }: TodayLoopTitleProps) {
  return (
    <div className="mt-2">
      <p className="text-sm text-gray-500">{dateText}</p>
      <h1 className="text-xl font-semibold mt-1">오늘의 루프</h1>
    </div>
  );
}

