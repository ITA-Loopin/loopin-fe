"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LoadingSpinnerProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LoadingSpinner({
  width = 96,
  height = 96,
  className,
}: LoadingSpinnerProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Next.js에서 public 폴더의 파일을 fetch로 로드
    fetch("/lottie/loading.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch animation");
        }
        return res.json();
      })
      .then((data) => {
        // 이미지 경로를 절대 경로로 수정
        if (data.assets && data.assets.length > 0) {
          data.assets = data.assets.map((asset: any) => ({
            ...asset,
            u: asset.u || "/images/",
          }));
        }
        setAnimationData(data);
      })
      .catch((err) => {
        console.error("Failed to load Lottie animation:", err);
        setHasError(true);
      });
  }, []);

  // 에러가 발생하거나 애니메이션 데이터가 없을 때 fallback 스피너 표시
  if (hasError || !animationData) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
          style={{ width: width * 0.6, height: height * 0.6 }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: "100%", height: "100%" }}
        onError={() => {
          // Lottie 렌더링 에러 발생 시 fallback으로 전환
          setHasError(true);
        }}
      />
    </div>
  );
}

export default LoadingSpinner;
