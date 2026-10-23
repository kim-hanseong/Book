"use client";

import React from "react";

import styles from "./index.module.css";

export default function LoadingModal() {
  return (
    <div className={styles.moveCard}>
      <div
        className={styles.delCard}
        style={{ textAlign: "center", padding: "40px 28px" }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="loadingTitle"
      >
        {/* 미니멀한 회전형 로딩 엠블럼 */}
        <div className={styles.loadingEmblem}>
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
            />
            <circle
              className={styles.loadingRing}
              cx="32"
              cy="32"
              r="28"
              stroke="var(--glow, #64ffda)"
              strokeWidth="1.5"
              strokeDasharray="44 132"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
