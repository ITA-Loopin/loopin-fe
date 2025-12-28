type ReportHeaderProps = {
  message: string;
};

export function ReportHeader({ message }: ReportHeaderProps) {
  // 메시지를 줄바꿈 기준으로 분리
  const messageLines = message.split("\n").filter((line) => line.trim());

  // 스타일 상수
  const firstLineStyle = "text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[#3A3D40]";
  const defaultTextStyle = "text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]";

  return (
    <div className="flex flex-col gap-1 px-6 pt-6">
      <div className="flex flex-col items-start w-[252px]">
        {messageLines.map((line, index) => (
          <p 
            key={index} 
            className={`whitespace-nowrap ${index === 0 ? firstLineStyle : defaultTextStyle} ${index === 1 ? "mt-3" : ""}`}
          >
            {line.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}

