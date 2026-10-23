"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { COMMENT_DELETE_DICTIONARY } from "@/constants/common/Alram/Comment/Delete/commentDeleteArlam";

interface CommentDeleteModalProps {
  onConfirm: () => Promise<void> | void;
}
export default function CommentDeleteModal({
  onConfirm,
}: CommentDeleteModalProps) {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = COMMENT_DELETE_DICTIONARY[lang];

  const [isLoading, setIsLoading] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // 모달 열릴 때 취소 버튼에 포커스 (실수 방지)
  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  // 물방울 퍼지는 인터랙션 효과 (water-fx)
  const handleWaterEffect = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 12 + Math.random() * 18;
      const sx = Math.cos(a) * d;
      const sy = Math.sin(a) * d;
      const dr = document.createElement("span");

      dr.className = styles.droplet;
      dr.style.left = `${cx}px`;
      dr.style.top = `${cy}px`;
      dr.style.setProperty("--sx", `${sx.toFixed(1)}px`);
      dr.style.setProperty("--sy", `${sy.toFixed(1)}px`);
      el.appendChild(dr);
      dr.addEventListener("animationend", () => dr.remove());
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      handleWaterEffect(e);
      await onConfirm();
      closeModal();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.moveCard}>
      <div
        className={styles.delCard}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delTitle"
        aria-describedby="delDesc"
      >
        <button
          type="button"
          className={clsx(styles.delClose, styles.waterFx)}
          onClick={(e) => {
            handleWaterEffect(e);
            closeModal();
          }}
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 휴지통 엠블럼 SVG */}
        <div className={styles.delEmblem}>
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
            <circle
              cx="32"
              cy="32"
              r="19"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            <g
              transform="translate(21.5 21.5) scale(0.875)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16" />
              <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
              <path d="M10 11v6M14 11v6" />
            </g>
          </svg>
        </div>

        <div className={styles.delEyebrow}>{t.eyebrow}</div>
        <div className={styles.delTitle} id="delTitle">
          {t.title.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < t.title.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.delDesc} id="delDesc">
          {t.desc}
        </div>

        <div className={styles.delActions}>
          <button
            type="button"
            className={clsx(styles.delBtn, styles.ghost)}
            ref={cancelBtnRef}
            onClick={closeModal}
            disabled={isLoading}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className={clsx(styles.delBtn, styles.danger, styles.waterFx)}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? t.deleting : t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
