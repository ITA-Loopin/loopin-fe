import type { ReportStatus } from "./LoopReport";

type ReportHeaderProps = {
  nickname: string;
  status: ReportStatus;
};

// 상태별 독려 메시지 정의
const greetingMessages: Record<ReportStatus, string> = {
  GOOD: "최근 루프가 안정적으로 이어지고 있어요! \n 이 흐름, 그대로 이어가도 좋아요",
  OK: "완벽하진 않았지만, 루프가 이어지고 있어요 \n 지금 상태로도 충분하지만, 조금 채워봐요!",
  HARD: "요즘 루프가 조금 버겁게 느껴졌을 수 있어요 \n 지금보다 가벼운 루프를 만들어볼까요?",
  EMPTY: "최근에는 루프가 설정되지 않았어요 \n 루프를 추가하러 가볼까요?",
};

export function ReportHeader({ nickname, status }: ReportHeaderProps) {
  const message = greetingMessages[status];
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

