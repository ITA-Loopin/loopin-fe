type TeamLoopFABProps = {
  onClick?: () => void;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  ariaLabel?: string;
  right?: string;
  bgColor?: string;
  border?: boolean;
  iconColor?: string; // SVG stroke 색상
  bottom?: string;
};

export function TeamLoopFAB({
  onClick,
  imageSrc,
  imageAlt,
  imageWidth = 18,
  imageHeight = 18,
  ariaLabel = "버튼",
  right = "right-4",
  bgColor = "bg-[var(--primary-500)]",
  border = false,
  iconColor,
  bottom = "bottom-28",
}: TeamLoopFABProps) {
  // SVG 파일인 경우 인라인으로 렌더링
  const isSvg = imageSrc.endsWith(".svg");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed ${bottom} ${right} z-50 flex h-[54px] w-[54px] items-center justify-center gap-[10px] rounded-[44px] ${bgColor} shadow-[0_2px_14px_0_rgba(0,0,0,0.15)] p-[14px] ${
        border ? "border border-[var(--gray-200)]" : ""
      }`}
      aria-label={ariaLabel}
    >
      {isSvg && imageSrc === "/team/GroupFAB.svg" ? (
        <svg
          width={imageWidth}
          height={imageHeight}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.64456 0.650392C8.01755 0.650899 6.42115 1.09271 5.02538 1.92876C3.62961 2.76481 2.48675 3.9638 1.71852 5.39801C0.950286 6.83223 0.585461 8.44797 0.662895 10.0731C0.74033 11.6983 1.25712 13.272 2.15824 14.6267L0.649902 18.6397L5.70075 17.7264C6.91697 18.3207 8.25166 18.6329 9.60532 18.6396C10.959 18.6463 12.2967 18.3474 13.5188 17.7651C14.7408 17.1829 15.8157 16.3323 16.6632 15.2768C17.5108 14.2213 18.1092 12.9881 18.4138 11.6691C18.7184 10.3502 18.7214 8.97948 18.4226 7.65921C18.1237 6.33893 17.5307 5.10314 16.6877 4.04396C15.8448 2.98477 14.7736 2.12951 13.5541 1.54193C12.3346 0.954344 10.9982 0.649593 9.64456 0.650392V0.650392Z"
            stroke={iconColor || "white"}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
        />
      )}
    </button>
  );
}
