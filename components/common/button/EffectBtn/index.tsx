"use client";

import React, { useRef } from "react";
import classNames from "classnames";

import styles from "./index.module.css";

import { ButtonProps } from "@/types/btn";

export type ButtonEffect = "water" | "gate" | "ripple" | "none";

export default function Button({
  children,
  effect = "none",
  variant,
  onClick,
  className,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;

    // Gate 이펙트 트리거
    if (el && effect === "gate") {
      el.classList.add(styles.pulse);
      setTimeout(() => {
        el.classList.remove(styles.pulse);
      }, 600);
    }

    onClick?.(e);
  };

  // gate 이펙트일 때는 전용 searchTrigger 클래스 적용, 아닐 때는 기본 btn 클래스
  const combinedClass = classNames(
    {
      [styles.searchTrigger]: effect === "gate",
      [styles.btn]: effect !== "gate",
      [styles[variant!]]: effect !== "gate" && variant,
    },
    className,
  );

  return (
    <button
      ref={btnRef}
      type="button"
      className={combinedClass}
      onClick={handleClick}
      {...props}
    >
      {effect === "gate" ? (
        <svg viewBox="0 0 38 38">
          <circle className={styles.r1} cx="19" cy="19" r="22" />
          <circle className={styles.r2} cx="19" cy="19" r="15" />
          <g className={styles.stCore}>
            <circle cx="17" cy="17" r="6.5" />
            <line x1="21.6" y1="21.6" x2="27" y2="27" />
          </g>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
