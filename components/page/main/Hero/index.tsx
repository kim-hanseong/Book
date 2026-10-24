"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

import style from "./index.module.css";

import { HERO_DICTIONARY } from "@/constants/main/Hero";
import { useLanguage } from "@/components/hook/useContextLanguge";

// 1. 그래픽 요소 (게이트 링)
export default function HeroSection() {
  const { lang } = useLanguage();
  const dict = HERO_DICTIONARY[lang];

  const heroRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const rainDropsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    const ringsEl = ringsRef.current;
    const rainDropsEl = rainDropsRef.current;

    if (!heroEl || !rainDropsEl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let rainTimer: NodeJS.Timeout;
    let dripTimer: NodeJS.Timeout;

    const spawnRaindrop = () => {
      if (!heroEl || !rainDropsEl) return;

      const heroH = heroEl.getBoundingClientRect().height;
      const heroW = heroEl.getBoundingClientRect().width;

      const depth = Math.random(); // 0 = 멀리, 1 = 가까이
      const height = 12 + depth * 22;
      const width = 1 + depth * 0.8;
      const opacity = 0.1 + depth * 0.28;
      const duration = 1.5 - depth * 0.7;
      const leftPct = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 30;
      const fall = heroH + 60;

      const d = document.createElement("span");

      d.className = style["raindrop"];
      d.style.left = `${leftPct}%`;
      d.style.width = `${width.toFixed(2)}px`;
      d.style.height = `${height.toFixed(1)}px`;
      d.style.setProperty("--op", opacity.toFixed(2));
      d.style.setProperty("--dur", `${duration.toFixed(2)}s`);
      d.style.setProperty("--drift", `${drift.toFixed(1)}px`);
      d.style.setProperty("--fall", `${fall.toFixed(0)}px`);

      rainDropsEl.appendChild(d);

      d.addEventListener("animationend", () => {
        // 바닥 근처 미세 낙수 스플래시 생성 (50% 확률)
        if (Math.random() < 0.5 && heroEl) {
          const splash = document.createElement("span");

          splash.className = style["drip-ripple"];
          splash.style.left = `${(leftPct / 100) * heroW + drift}px`;
          splash.style.top = `${heroH - 6}px`;
          splash.style.width = "4px";
          splash.style.height = "4px";
          heroEl.appendChild(splash);
          splash.addEventListener("animationend", () => splash.remove());
        }
        d.remove();
      });
    };

    const rainLoop = () => {
      spawnRaindrop();
      rainTimer = setTimeout(rainLoop, 100 + Math.random() * 180);
    };

    // ----- [2] 게이트 링 둘레 파문 생성 함수 -----
    const spawnDrip = () => {
      if (!heroEl || !ringsEl) return;

      const rect = ringsEl.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      const useOuter = Math.random() > 0.45;
      const r = useOuter ? 390 : 270;
      const angle = Math.random() * Math.PI * 2;

      const scale = rect.width / 800;
      const cx =
        rect.left - heroRect.left + 400 * scale + Math.cos(angle) * r * scale;
      const cy =
        rect.top - heroRect.top + 400 * scale + Math.sin(angle) * r * scale;

      const drip = document.createElement("span");

      drip.className = style["drip-ripple"];
      drip.style.left = `${cx}px`;
      drip.style.top = `${cy}px`;
      heroEl.appendChild(drip);
      drip.addEventListener("animationend", () => drip.remove());
    };

    const dripLoop = () => {
      spawnDrip();
      const next = 1400 + Math.random() * 2200;

      dripTimer = setTimeout(dripLoop, next);
    };

    // 인터랙션 시작
    rainLoop();
    dripTimer = setTimeout(dripLoop, 1200);

    // Clean-up: 컴포넌트 언마운트 시 타이머 해제
    return () => {
      clearTimeout(rainTimer);
      clearTimeout(dripTimer);
    };
  }, []);

  return (
    <>
      <section className={style.hero} ref={heroRef}>
        {/* 상부 미광 */}
        <div className={style["cave-light"]} />

        {/* 배경 게이트 링 */}
        <GateRings ringsRef={ringsRef} />

        {/* 빗방울 레이어 */}
        <div
          className={style["rain-drops"]}
          ref={rainDropsRef}
          aria-hidden="true"
        />

        <div className={style["hero-content"]}>
          <div className={style["hero-eyebrow"]}>{dict.eyebrow}</div>
          <h1>
            {dict.titlePart1}
            <br />
            <span className={style.accent}>{dict.titleAccent}</span>
            {dict.titlePart2}
          </h1>
          <p>{dict.description}</p>

          <div className={style["hero-cta"]}>
            <Link
              href="#shelves"
              className={`${style.btn} ${style.primary} ${style["water-fx"]}`}
            >
              {dict.ctaPrimary}
            </Link>
            <Link href="#" className={`${style.btn} ${style["water-fx"]}`}>
              {dict.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className={style["scroll-cue"]}>
          <span>{dict.scrollCue}</span>
          <span className={style.bar} />
        </div>
      </section>
      <GateDivider />
    </>
  );
}

function GateRings({
  ringsRef,
}: {
  ringsRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={style["gate-rings"]} aria-hidden="true">
      <div className={style.band} />
      <svg viewBox="0 0 800 800" width="100%" height="100%">
        <circle
          cx="400"
          cy="400"
          r="390"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="400"
          cy="400"
          r="270"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function GateDivider() {
  return (
    <div className={style["gate-divider"]}>
      <div className={style.line} />
      <svg viewBox="0 0 44 44" fill="none">
        <circle
          cx="22"
          cy="22"
          r="20"
          stroke="#f2f1ea"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle
          cx="22"
          cy="22"
          r="13"
          stroke="#f2f1ea"
          strokeWidth="1.8"
          opacity="0.3"
        />
        <circle cx="22" cy="22" r="3" fill="#f2f1ea" />
      </svg>
      <div className={`${style.line} ${style.right}`} />
    </div>
  );
}
