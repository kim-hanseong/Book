"use client";

import React from "react";
import clsx from "clsx";
import styles from "./index.module.css";
import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { COMMENT_SUCCESS_DICTIONARY } from "@/constants/common/Alram/Comment/Success/commentSuccessArlam";

export default function CommentSuccessModal() {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = COMMENT_SUCCESS_DICTIONARY[lang];

  return (
    <div className={styles.moveCard}>
      <div
        className={styles.delCard}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="successTitle"
      >
        {/* 성공 체크 아이콘 엠블럼 */}
        <div className={styles.delEmblem}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div className={styles.delEyebrow}>{t.eyebrow}</div>
        <div className={styles.delTitle} id="successTitle">
          {t.title}
        </div>
        <div className={styles.delDesc}>{t.desc}</div>

        <div className={styles.delActions}>
          <button type="button" className={styles.btn} onClick={closeModal}>
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
