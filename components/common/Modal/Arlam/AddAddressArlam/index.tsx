"use client";

import React, { useRef } from "react";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { ADDRESS_DONE_DICTIONARY } from "@/constants/common/Alram/AddAddress/addressDoneModal";

export default function AddressDoneModal() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ADDRESS_DONE_DICTIONARY[lang];

  const handleWaterClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const cx = e.clientX - rect.left; // 💡 누락되었던 연산자 복구
    const cy = e.clientY - rect.top; // 💡 누락되었던 연산자 복구

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2; // 💡 누락되었던 연산자 복구
      const distance = 10 + Math.random() * 14;
      const sx = Math.cos(angle) * distance;
      const sy = Math.sin(angle) * distance;

      const dr = document.createElement("span");

      dr.className = styles.droplet;
      dr.style.left = `${cx}px`;
      dr.style.top = `${cy}px`;
      dr.style.setProperty("--sx", `${sx.toFixed(1)}px`);
      dr.style.setProperty("--sy", `${sy.toFixed(1)}px`);

      btn.appendChild(dr);
      dr.addEventListener("animationend", () => dr.remove());
    }

    // 💡 물방울 애니메이션(약 0.4초)이 자연스럽게 연출되도록 200ms 딜레이 후 모달 닫기
    setTimeout(() => {
      closeModal();
    }, 200);
  };

  return (
    <div className={styles.moveCard}>
      <div className={styles.card} ref={cardRef}>
        <div className={styles.emblem}>
          <svg viewBox="0 0 96 96" fill="none">
            <circle
              className={styles.ring}
              cx="48"
              cy="48"
              r="36"
              transform="rotate(-90 48 48)"
            />
            <circle
              className={`${styles.ripple} ${styles.r3}`}
              cx="48"
              cy="48"
              r="8"
            />
            <circle className={styles.drop} cx="48" cy="48" r="3" />
          </svg>
        </div>

        <div className={styles.eyebrow}>{t.eyebrow}</div>
        <div className={styles.title}>
          {t.title.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < t.title.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.desc}>{t.desc}</div>

        <button type="button" className={styles.btn} onClick={handleWaterClick}>
          {t.confirm}
        </button>
      </div>
    </div>
  );
}
