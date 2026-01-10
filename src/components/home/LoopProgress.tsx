type LoopProgressProps = {
  progress: number;
};

export function LoopProgress({ progress }: LoopProgressProps) {
  // SVG 크기: 320px (w-80 h-80) - EmptyLoopView와 동일한 크기
  const size = 320;
  const center = size / 2;
  // 외곽 링 반지름: EmptyLoopView의 외부 링과 비슷하게 (320px 컨테이너 기준)
  // EmptyLoopView는 inset-0이므로 실제 원은 border 두께를 고려해야 함
  // 반지름을 약 144px로 설정하면 전체 크기가 약 288px 정도 (strokeWidth 24 포함)
  const radius = 144;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <section>
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="h-80 w-80 drop-shadow-[0px_4px_12px_rgba(0,0,0,0.1)]"
        >
          <defs>
            {/* 외곽 링 그라데이션 - 빨강-오렌지 */}
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF543F" />
              <stop offset="100%" stopColor="#FF7A5F" />
            </linearGradient>
            {/* 내부 방사형 그라데이션 - 중심에서 바깥으로 페이드 */}
            <radialGradient id="innerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4E0" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FFF5F3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </radialGradient>
          </defs>
          
          {/* 내부 그라데이션 원 - 먼저 그려서 링 아래에 배치 */}
          <circle
            cx={center}
            cy={center}
            r={radius - 20}
            fill="url(#innerGradient)"
          />
          
          {/* 외곽 링 배경 (매우 연한 흰색/회색) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="24"
            opacity="0.5"
          />
          
          {/* 진행률 링 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="24"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-[stroke-dashoffset] duration-[3000ms] ease-out"
          />
        </svg>
        
        {/* 루프 중앙 디자인 요소 */}
        <div
          className="absolute rounded-full"
          style={{
            width: "157px",
            height: "157px",
            transform: "rotate(33.923deg)",
            borderRadius: "157px",
            background: "linear-gradient(145deg, rgba(255, 84, 63, 0.40) 26.7%, rgba(242, 255, 213, 0.40) 88.06%)",
            filter: "blur(40px)",
          }}
        ></div>
        
        {/* 중앙 퍼센트 텍스트 */}
        <span className="absolute flex h-[45px] w-[81px] items-center justify-center text-2xl font-bold text-[#FF543F]">
          {progress}%
        </span>
      </div>
    </section>
  );
}

