export function EmptyLoopView() {
  // SVG 크기: 320px (w-80 h-80) - LoopProgress와 동일한 크기
  const size = 320;
  const center = size / 2;
  const radius = 144;
  const circumference = 2 * Math.PI * radius;
  // progress가 0%이므로 offset은 전체 circumference
  const offset = circumference;

  return (
    <>
      {/* 엠티뷰: 중앙 원형 요소 */}
      <section className="flex items-center justify-center mt-4 mb-6">
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="h-80 w-80 drop-shadow-[0px_4px_12px_rgba(0,0,0,0.1)]"
          >
            <defs>
              {/* 외곽 링 그라데이션 - 제공된 SVG 디자인 색상 (#FF3A21 -> #FFCAC3) */}
              <linearGradient id="emptyProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3A21" />
                <stop offset="100%" stopColor="#FFCAC3" />
              </linearGradient>
              {/* 내부 방사형 그라데이션 - 중심에서 바깥으로 페이드 */}
              <radialGradient id="emptyInnerGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE4E0" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#FFF5F3" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </radialGradient>
              {/* 외곽 링 필터 */}
              <filter id="emptyFilter0_d_3956_5318" x="0" y="0" width={size} height={size} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="7.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.487248 0 0 0 0 0.487248 0 0 0 0 0.487248 0 0 0 0.12 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3956_5318"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3956_5318" result="shape"/>
              </filter>
            </defs>
            
            {/* 내부 그라데이션 원 - 먼저 그려서 링 아래에 배치 */}
            <circle
              cx={center}
              cy={center}
              r={radius - 20}
              fill="url(#emptyInnerGradient)"
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
            
            {/* 진행률 링 (0%이므로 보이지 않음) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#emptyProgressGradient)"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
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
        </div>
      </section>

      {/* Loop List · 0 */}
      <section className="relative">
        <div>
          <h2 className="font-semibold text-lg">Loop List · 0</h2>
        </div>
      </section>
    </>
  );
}

