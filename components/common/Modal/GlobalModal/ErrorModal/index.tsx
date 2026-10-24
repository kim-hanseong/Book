"use client";

import React, { useRef } from "react";

import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { ERROR_MODAL_DICTIONARY } from "@/constants/ErrorModal";
import { useModalStack } from "@/components/hook/useContextModal";

export default function ErrorModal() {
  const { lang } = useLanguage();
  const { closeModal } = useModalStack();
  const dict = ERROR_MODAL_DICTIONARY[lang];

  const isClosingRef = useRef(false);

  const handleSafeClose = () => {
    // 이미 닫히는 중이라면 추가 로직을 실행하지 않고 즉시 종료
    if (isClosingRef.current) return;

    // 첫 클릭 시 닫힘 상태로 변경하여 이후 클릭 차단
    isClosingRef.current = true;
    closeModal();
  };

  return (
    <div className={styles.errorOverlay} id="errorOverlay">
      <div className={styles.errorCard}>
        <button
          type="button"
          className={`${styles.errorClose} ${styles.waterFx}`}
          id="errorClose"
          aria-label={dict.closeLabel}
          onClick={handleSafeClose}
        >
          ✕
        </button>
        <div className={styles.errorEmblem}>
          <svg viewBox="0 0 72 72" fill="none">
            <path
              className={styles.core}
              d="M36 4 A32 32 0 1 1 8 20"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <circle
              className={styles.core}
              cx="36"
              cy="36"
              r="21"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
            />
            <path
              className={styles.core}
              d="M28 28 L44 44 M44 28 L28 44"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className={styles.errorEyebrow}>{dict.eyebrow}</div>
        <div className={styles.errorTitle} id="errorTitle">
          {dict.defaultTitle}
        </div>
        <div className={styles.errorDesc} id="errorDesc">
          {dict.defaultDesc}
        </div>
        <div className={styles.errorCode} id="errorCode">
          {dict.defaultCode}
        </div>
        <div className={styles.errorActions}>
          <button
            type="button"
            className={`${styles.errorBtn} ${styles.ghost} ${styles.waterFx}`}
            id="errorDismiss"
            onClick={handleSafeClose}
          >
            {dict.dismissBtn}
          </button>
          <button
            type="button"
            className={`${styles.errorBtn} ${styles.primary} ${styles.waterFx}`}
            id="errorRetry"
            onClick={handleSafeClose}
          >
            {dict.retryBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
