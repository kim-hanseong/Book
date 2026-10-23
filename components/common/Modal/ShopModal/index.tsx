"use client";

import React from "react";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { Created } from "../../Product/Created";
import { Thumbnail } from "../../Product/Thumbnail";
import { Title } from "../../Product/Title";
import { Authors } from "../../Product/Authors";
import { Price } from "../../Product/Price";
import KarmaRating from "../../Rating";
import { CloseButton } from "../../button/CloseBtn";
import { DeleteButton } from "../../button/DeleteBtn";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { Book } from "@/types/book";
import { useToggleShopMutation } from "@/Hook/BuyBtn/useToggleBuyMutation";
import { queryKeys } from "@/lib/query/querykeys";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { SHOP_MODAL_DICTIONARY } from "@/constants/common/Modal/ShopModal/shopModal";
import { SHOP_EMPTY_DICTIONARY } from "@/constants/order/order";


const THUMB_W = 126;
const THUMB_H = 178;

export default function ShopModal({ shop }: { shop: Book[] }) {
  const router = useRouter();
  const { closeModal } = useModalStack();

  const { data: shopList = [] } = useQuery<Book[]>({
    queryKey: queryKeys.cart.list(),
    queryFn: fetchBuyList,
    initialData: shop,
  });

  const isEmpty = shopList.length === 0;

  // 구매하기 버튼 클릭 시 /order 이동 및 모달 닫기
  const handleNavigateToOrder = () => {
    closeModal();
    router.push("/order");
  };

  return (
    <div className={classNames(styles.modalContainer, styles.open)}>
      <section
        className={classNames(
          styles.shopSection,
          isEmpty && styles.shopSectionEmpty,
        )}
      >
        <ShopTitle />

        {isEmpty ? <EmptyShop /> : <ShopList items={shopList} />}

        {!isEmpty && <ShopFooter onRouter={handleNavigateToOrder} />}
      </section>
    </div>
  );
}

function ShopTitle() {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();

  const t = SHOP_MODAL_DICTIONARY[lang];

  return (
    <div>
      <h3>{t.title}</h3>
      <CloseButton onClick={closeModal} />
    </div>
  );
}

/* ==========================================================================
   SUB COMPONENTS
   ========================================================================== */

function ShopList({ items }: { items: Book[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <ShopItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

function ShopItem({ item }: { item: Book }) {
  const { mutate: toggleShop } = useToggleShopMutation();

  const handleDelete = () => {
    toggleShop(item);
  };

  return (
    <li className={styles.item}>
      <DeleteButton onClick={handleDelete} />

      <Thumbnail
        data={item}
        w={THUMB_W}
        h={THUMB_H}
        className={styles.itemThumb}
      />

      <div className={styles.itemBody}>
        <Title data={item} className={styles.itemTitle} />
        <Authors data={item} className={styles.itemAuthor} />
        <KarmaRating rating={4} size={32} />

        <div className={styles.itemBottom}>
          <Price data={item} className={styles.modalTotal} />
        </div>

        <Created data={item} className={styles.itemDate} />
      </div>
    </li>
  );
}

function EmptyShop() {
  const { lang } = useLanguage();
  const t = SHOP_EMPTY_DICTIONARY[lang];

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

  return (
    <div className={styles.cartEmpty}>
      <div className={styles.emptyEmblem}>
        <svg viewBox="0 0 64 64" fill="none">
          <circle
            className={styles.emptyRing}
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          <circle
            className={styles.emptyRing}
            cx="32"
            cy="32"
            r="19"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <g
            transform="translate(22 22) scale(0.834)"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 7Z" />
            <path d="M8 7V5a4 4 0 0 1 8 0v2" />
          </g>
        </svg>
      </div>

      <div className={styles.emptyEyebrow}>{t.emptyEyebrow}</div>
      <div className={styles.emptyTitle}>{t.emptyTitle}</div>
      <div className={styles.emptyDesc}>
        {t.emptyDesc.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < t.emptyDesc.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        className={clsx(styles.emptyCta, styles.waterFx)}
        onClick={(e) => {
          handleWaterEffect(e);
        }}
      >
        {t.exploreCta}
      </button>
    </div>
  );
}

function ShopFooter({ onRouter }: { onRouter: () => void }) {
  const { lang } = useLanguage();
  const t = SHOP_MODAL_DICTIONARY[lang];

  return (
    <div className={styles.shopFooter}>
      <button
        type="button"
        className={styles.purchaseButton}
        onClick={onRouter}
      >
        {t.purchaseButton}
      </button>
    </div>
  );
}
