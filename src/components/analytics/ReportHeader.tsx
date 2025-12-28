type ReportHeaderProps = {
  message: string;
};

export function ReportHeader({ message }: ReportHeaderProps) {
  // 메시지를 줄바꿈 기준으로 분리
  const messageLines = message.split("\n").filter((line) => line.trim());

  // 스타일 상수
  const firstLineStyle = "text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[var(--gray-800,#3A3D40)] mb-3";
  const defaultTextStyle = "text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-800,#3A3D40)]";

  return (
    <div className="flex flex-col px-6 pt-6">
      <div className="flex flex-col items-start w-[216px]">
        {messageLines.map((line, index) => (
          <p 
            key={index} 
            className={`whitespace-nowrap ${index === 0 ? firstLineStyle : defaultTextStyle}`}
          >
            {line.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}

