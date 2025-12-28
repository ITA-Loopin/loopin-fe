"use client";

import { useEffect } from "react";

export function FontLoader() {
  useEffect(() => {
    // 이미 로드되어 있는지 확인
    const existingLink = document.querySelector(
      'link[href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"]'
    );
    
    if (existingLink) {
      return;
    }

    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      const linkToRemove = document.querySelector(
        'link[href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"]'
      );
      if (linkToRemove) {
        document.head.removeChild(linkToRemove);
      }
    };
  }, []);

  return null;
}

