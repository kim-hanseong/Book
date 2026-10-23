"use client";

import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import styles from "./index.module.css";

interface KarmaRatingProps {
  rating?: number | string;
  ratingCount?: number;
  size?: number | string;
  fontSize?: number | string;
  className?: string;
  readOnly?: boolean;
  onChange?: (newRating: number) => void;
}

export default function KarmaRating({
  rating = 0,
  size,
  fontSize,
  className,
  readOnly = true,
  onChange,
}: KarmaRatingProps) {
  const numericRating = Math.max(0, Number(rating) || 0);

  const TOTAL_SEGS = 12;
  const targetCount = Math.max(0, Math.round((numericRating / 5) * TOTAL_SEGS));

  const [filledCount, setFilledCount] = useState(0);
  const [hoverCount, setHoverCount] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilledCount(targetCount);
    }, 100);

    return () => clearTimeout(timer);
  }, [targetCount]);

  const activeCount = hoverCount !== null ? hoverCount : filledCount;

  const displayScore =
    hoverCount !== null
      ? Number(((hoverCount / TOTAL_SEGS) * 5).toFixed(1))
      : numericRating;

  // 🎯 마우스/터치 좌표를 원형 각도로 변환해 선택된 세그먼트 인덱스(1~12) 계산
  const getSegmentFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // 12시 방향을 0으로 만드는 각도 연산
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    const segIndex = Math.floor((angle / (Math.PI * 2)) * TOTAL_SEGS);
    return Math.min(TOTAL_SEGS, Math.max(1, segIndex + 1));
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const seg = getSegmentFromPointer(e);
    setHoverCount(seg);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const selectedSegs = getSegmentFromPointer(e);
    const newRating = Number(((selectedSegs / TOTAL_SEGS) * 5).toFixed(1));
    onChange?.(newRating);
  };

  const formattedSize = typeof size === "number" ? `${size}px` : size;
  const formattedFontSize =
    typeof fontSize === "number" ? `${fontSize}px` : fontSize;

  return (
    <div
      className={classNames(styles.karmaRatingWrap, className)}
      style={{
        ...(formattedSize && {
          width: formattedSize,
          height: formattedSize,
        }),
      }}
    >
      <div className={styles.karmaSvgStage}>
        <svg
          viewBox="0 0 100 100"
          className={styles.karmaSvg}
          style={{ cursor: readOnly ? "default" : "pointer" }}
          // 🎯 SVG 전체 판을 클릭/호버 감지 영역으로 활용
          onPointerMove={handlePointerMove}
          onPointerLeave={() => !readOnly && setHoverCount(null)}
          onPointerDown={handlePointerDown}
        >
          {Array.from({ length: TOTAL_SEGS }).map((_, i) => {
            const a1 = (i / TOTAL_SEGS) * Math.PI * 2 - Math.PI / 2 + 0.05;
            const a2 =
              ((i + 1) / TOTAL_SEGS) * Math.PI * 2 - Math.PI / 2 - 0.05;
            const r = 40;
            const x1 = (50 + r * Math.cos(a1)).toFixed(2);
            const y1 = (50 + r * Math.sin(a1)).toFixed(2);
            const x2 = (50 + r * Math.cos(a2)).toFixed(2);
            const y2 = (50 + r * Math.sin(a2)).toFixed(2);

            const isFilled = i < activeCount;

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                className={classNames(styles.seg, { [styles.on]: isFilled })}
                style={{
                  pointerEvents: "none", // 🎯 이벤트는 부모 SVG가 다 처리하므로 path 패스 포인터 차단
                  transitionDelay:
                    hoverCount !== null
                      ? "0ms"
                      : isFilled
                        ? `${i * 40}ms`
                        : "0ms",
                }}
              />
            );
          })}
        </svg>

        <div
          className={classNames(styles.karmaCoreScore, {
            [styles.showScore]: activeCount >= 0 || readOnly,
          })}
          style={{
            ...(formattedFontSize && { fontSize: formattedFontSize }),
          }}
        >
          {displayScore.toFixed(1)}
        </div>
      </div>

      <div className={styles.karmaInfo}></div>
    </div>
  );
}
