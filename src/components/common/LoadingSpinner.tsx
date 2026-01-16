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
      });
  }, []);

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default LoadingSpinner;
