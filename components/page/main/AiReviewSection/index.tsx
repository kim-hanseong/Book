"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import styles from "./index.module.css";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { AI_REVIEW_SECTION_DICTIONARY } from "@/constants/main/AiReview";

interface FirefliesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
  className?: string;
}

interface FireflyData {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  riseDistance: number; // 위로만 올라갈 Y축 거리
  peakOpacity: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function Fireflies({
  count = 18,
  color = "rgba(214, 255, 214, 0.95)",
  minSize = 2,
  maxSize = 4,
  minDuration = 4,
  maxDuration = 8,
  className,
}: FirefliesProps) {
  const fireflies = useMemo<FireflyData[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: rand(5, 95), // 이미지 좌우 내부 영역으로 한정 (5% ~ 95%)
      top: rand(80, 95), // 이미지 하단 내부 영역에서 시작
      size: rand(minSize, maxSize),
      duration: rand(minDuration, maxDuration),
      delay: rand(0, 5),
      riseDistance: rand(150, 300), // 이미지 섹션 안에서만 상승하는 적당한 거리 (px)
      peakOpacity: rand(0.6, 0.95),
    }));
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  const keyframeCss = useMemo(() => {
    return fireflies
      .map((f) => {
        // 좌우 이동(X축) 없이 Y축(-translateY)으로만 직선 상승
        return `@keyframes firefly-straight-up-${f.id} {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: ${f.peakOpacity.toFixed(2)};
          }
          80% {
            opacity: ${f.peakOpacity.toFixed(2)};
          }
          100% {
            transform: translateY(-${f.riseDistance.toFixed(1)}px);
            opacity: 0;
          }
        }`;
      })
      .join("\n");
  }, [fireflies]);

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden", // 이미지 영역 밖으로 크게 나가지 못하도록 제한
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: keyframeCss }} />
      {fireflies.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute",
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${color}`,
            animation: `firefly-straight-up-${f.id} ${f.duration}s linear ${f.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

export default function AiReviewSection() {
  const { lang } = useLanguage();
  const t = AI_REVIEW_SECTION_DICTIONARY[lang];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>{t.badge}</span>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </div>

      {/* AI Review Display Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            overflow: "hidden", // 반딧불이 카드 범위를 넘지 않게 자름
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src="/mainpage.png"
            alt={t.imageAlt}
            width={732}
            height={1116}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
          <Fireflies count={18} />
        </div>
      </div>
    </section>
  );
}
