type ReportHeaderProps = {
  nickname: string;
  message: string;
};

export function ReportHeader({ nickname, message }: ReportHeaderProps) {
  // 메시지를 줄바꿈 기준으로 분리
  const messageLines = message.split("\n").filter((line) => line.trim());

  return (
    <div className="flex flex-col gap-1 px-6 pt-6">
      {/* 인사말 */}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-[#2C2C2C]">
          {nickname}님,
        </p>
        {messageLines.map((line, index) => (
          <p key={index} className="text-base text-[#2C2C2C]">
            {line.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}

