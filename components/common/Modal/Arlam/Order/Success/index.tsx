"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useModalStack } from "@/components/hook/useContextModal";
import { Book } from "@/types/book";

import styles from "./index.module.css";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { ORDER_SUCCESS_DICTIONARY } from "@/constants/common/Alram/Order/orderSiccessArlam";

export default function OrderSuccessModal() {
  const router = useRouter();
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ORDER_SUCCESS_DICTIONARY[lang];

  const handleContinue = () => {
    closeModal();
  };

  const handleOrder = () => {
    closeModal();
    router.push("/"); // 주문 내역 페이지 등으로 이동 (필요시 경로 수정)
  };

  return (
    <section
      className={styles.moveCard}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleContinue}
        aria-label={t.closeModal}
      >
        ✕
      </button>

      <OrderSuccessEmblem />

      <p className={styles.eyebrow}>{t.eyebrow}</p>

      <h2 id="order-success-title" className={styles.title}>
        {t.titleLine1}
        <br />
        {t.titleLine2}
      </h2>

      <p className={styles.description}>
        {t.descLine1}
        <br />
        {t.descLine2}
      </p>

      <OrderSuccessActions onContinue={handleContinue} onOrder={handleOrder} />
    </section>
  );
}

function OrderSuccessEmblem() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);

    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`${styles.emblem} ${animate ? styles.show : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 58 58" fill="none">
        <circle
          className={styles.ringOuter}
          cx="29"
          cy="29"
          r="25"
          strokeWidth="1"
        />

        <circle
          className={styles.ringFill}
          cx="29"
          cy="29"
          r="25"
          strokeWidth="1.5"
          transform="rotate(-90 29 29)"
        />

        <path
          className={styles.check}
          d="M19 29.5l7 7 13-14"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

interface OrderItemSummaryProps {
  title: string;
  author: string;
  thumbnail?: string;
  price: number;
  quantity: number;
}

function OrderItemSummary({
  title,
  author,
  thumbnail,
  price,
  quantity,
}: OrderItemSummaryProps) {
  const { lang } = useLanguage();
  const t = ORDER_SUCCESS_DICTIONARY[lang];

  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <p className={styles.itemTitle} title={title}>
          {title}
        </p>
        <p className={styles.itemMeta}>
          {author ? `${author} · ` : ""}
          {t.formatQuantity(quantity)}
        </p>
      </div>

      {/* 단가와 수량을 곱한 총 가격 계산 오타 수정 (*) */}
      <p className={styles.itemPrice}>{t.formatPrice(price * quantity)}</p>
    </div>
  );
}

interface OrderSuccessActionsProps {
  onContinue: () => void;
  onOrder: () => void;
}

function OrderSuccessActions({
  onContinue,
  onOrder,
}: OrderSuccessActionsProps) {
  const { lang } = useLanguage();
  // CART_SUCCESS_DICTIONARY 대신 새로 만드신 ORDER_SUCCESS_DICTIONARY 적용
  const t = ORDER_SUCCESS_DICTIONARY[lang];

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.ghost}`}
        onClick={onContinue}
      >
        {t.continueButton}
      </button>

      <button
        type="button"
        className={`${styles.actionButton} ${styles.primary}`}
        onClick={onOrder}
      >
        {t.orderButton}
      </button>
    </div>
  );
}
