"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useModalStack } from "@/components/hook/useContextModal";
import { Book } from "@/types/book";

import styles from "./index.module.css";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { CART_SUCCESS_DICTIONARY } from "@/constants/common/Alram/CartSuccess/cartsucces";

interface CartSuccessModalProps {
  data: Book;
  quantity?: number;
}

export default function CartSuccessModal({
  data,
  quantity = 1,
}: CartSuccessModalProps) {
  const router = useRouter();
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = CART_SUCCESS_DICTIONARY[lang];

  const handleContinue = () => {
    closeModal();
  };

  const handleOrder = () => {
    closeModal();
    router.push("/order");
  };

  return (
    <section
      className={styles.moveCard}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-success-title"
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleContinue}
        aria-label={t.closeModal}
      >
        ✕
      </button>

      <CartSuccessEmblem />

      <p className={styles.eyebrow}>{t.eyebrow}</p>

      <h2 id="cart-success-title" className={styles.title}>
        {t.titleLine1}
        <br />
        {t.titleLine2}
      </h2>

      <p className={styles.description}>
        {t.descLine1}
        <br />
        {t.descLine2}
      </p>

      <CartItemSummary
        title={data.title}
        author={"authors" in data ? (data.authors ?? []).join(", ") : ""}
        thumbnail={data.thumbnail}
        price={data.price}
        quantity={quantity}
      />

      <CartSuccessActions onContinue={handleContinue} onOrder={handleOrder} />
    </section>
  );
}

function CartSuccessEmblem() {
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

interface CartItemSummaryProps {
  title: string;
  author: string;
  thumbnail?: string;
  price: number;
  quantity: number;
}

function CartItemSummary({
  title,
  author,
  thumbnail,
  price,
  quantity,
}: CartItemSummaryProps) {
  const { lang } = useLanguage();
  const t = CART_SUCCESS_DICTIONARY[lang];

  return (
    <div className={styles.item}>
      <div className={styles.thumbnail}>
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={t.coverAlt(title)}
            width={34}
            height={46}
            className={styles.thumbnailImage}
          />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6c3-1.6 6-1.6 9 0 3-1.6 6-1.6 9 0v13c-3-1.6-6-1.6-9 0-3-1.6-6-1.6-9 0Z" />
          </svg>
        )}
      </div>

      <div className={styles.itemInfo}>
        <p className={styles.itemTitle} title={title}>
          {title}
        </p>
        <p className={styles.itemMeta}>
          {author ? `${author} · ` : ""}
          {t.formatQuantity(quantity)}
        </p>
      </div>

      <p className={styles.itemPrice}>{t.formatPrice(price * quantity)}</p>
    </div>
  );
}

interface CartSuccessActionsProps {
  onContinue: () => void;
  onOrder: () => void;
}

function CartSuccessActions({ onContinue, onOrder }: CartSuccessActionsProps) {
  const { lang } = useLanguage();
  const t = CART_SUCCESS_DICTIONARY[lang];

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
