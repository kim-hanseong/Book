"use client";

import React, { useState, useCallback, useMemo } from "react";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import styles from "./index.module.css";

import { Book } from "@/types/book";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { FEATURED_BOOKS_DICTIONARY } from "@/constants/main/FeaturedBooks";
import { useModalStack } from "@/components/hook/useContextModal";
import { fetchBestSeller } from "@/lib/SSG/fetchBestSeller";
import DetailModal from "@/components/common/Modal/DetailModal";
import { LikeButton } from "@/components/common/button/LikeBtn";
import { BuyButton } from "@/components/common/button/BuyBtn";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import { Authors } from "@/components/common/Product/Authors";
import { Price } from "@/components/common/Product/Price";

export interface FeaturedBooksProps {
  data: Book[];
  isLoading?: boolean;
}

const CATEGORY_MAP = [
  { id: "eBook", code: "E", apiCategory: "best_category_eBook" },
  { id: "foreign", code: "F", apiCategory: "best_category_foreign" },
  { id: "domestic", code: "D", apiCategory: "best_category_domestic" },
] as const;

export default function FeaturedBooks({ data }: FeaturedBooksProps) {
  const { lang } = useLanguage();
  const dict = FEATURED_BOOKS_DICTIONARY[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>("eBook");
  const { openModal } = useModalStack();

  const apiCategory = useMemo(() => {
    return (
      CATEGORY_MAP.find((c) => c.id === selectedCategory)?.apiCategory ??
      "best_category_eBook"
    );
  }, [selectedCategory]);

  const { data: bestSellerData = data } = useQuery({
    queryKey: ["bestSeller", apiCategory, "추천일순"],
    queryFn: () => fetchBestSeller(apiCategory, "추천일순"),
    placeholderData: data,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (서버 트래픽 방어)
  });

  const handleOpenDetailModal = useCallback(
    (bookData: Book) => {
      openModal("detail-modal", <DetailModal data={bookData} />);
    },
    [openModal],
  );

  return (
    <>
      <ProductCategory
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory} // 💡 성능 최적화 3: map/join 연산 제거
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductLayout ariaLabel={dict.ariaLabelProduct}>
            {bestSellerData.map((bookItem, index) => {
              const itemKey = bookItem.isbn || bookItem.id || index;

              return (
                <ProductWrap key={itemKey}>
                  <div className={styles.flexContainer}>
                    <ProductThumbnail data={bookItem} />
                    <ProductInfo>
                      <PearlBody
                        data={bookItem}
                        buttonText={dict.takePearlBtn}
                        onOpenModal={() => handleOpenDetailModal(bookItem)}
                      />
                    </ProductInfo>
                  </div>
                </ProductWrap>
              );
            })}
          </ProductLayout>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

interface ProductCategoryProps {
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
}

export const ProductCategory = React.memo(
  ({ activeCategory = "eBook", onSelectCategory }: ProductCategoryProps) => {
    const { lang } = useLanguage();
    const dict = FEATURED_BOOKS_DICTIONARY[lang];

    return (
      <section id="shelves" className={styles.shelvesSection}>
        <div className={styles.sectionHead}>
          <div className={styles.eyebrow}>{dict.sectionEyebrow}</div>
          <h2>{dict.sectionTitle}</h2>
        </div>

        <div className={styles.regions}>
          {CATEGORY_MAP.map((category) => {
            return (
              <button
                key={category.id}
                type="button"
                className={classNames(styles.regionTab, {
                  [styles.active]: activeCategory === category.id,
                })}
                onClick={() => onSelectCategory?.(category.id)}
              >
                <span className={styles.code}>{category.code}</span>
                {category.id}
              </button>
            );
          })}
        </div>
      </section>
    );
  },
);
ProductCategory.displayName = "ProductCategory";

const ProductLayout = ({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) => {
  return (
    <article className={styles.LayOut} aria-label={ariaLabel}>
      {children}
    </article>
  );
};

const ProductWrap = ({ children }: { children: React.ReactNode }) => {
  return (
    <figure className={styles.Wrap} role="listitem">
      {children}
    </figure>
  );
};

const ProductThumbnail = React.memo(({ data }: { data: Book }) => {
  return (
    <div className={styles.imageWrap} style={{ cursor: "pointer" }}>
      <Thumbnail data={data} w={226} h={320} />
      <div className={styles.overlay}>
        <div className={styles.actionGroup}>
          <LikeButton data={data} className={styles.actionBtn} />
          <BuyButton data={data} className={styles.actionBtn} />
        </div>
      </div>
    </div>
  );
});

ProductThumbnail.displayName = "ProductThumbnail";

const ProductInfo = ({ children }: { children: React.ReactNode }) => {
  return <figcaption className={styles.infoWrap}>{children}</figcaption>;
};

interface PearlBodyProps {
  data: Book;
  buttonText: string;
  onOpenModal?: () => void;
}

export const PearlBody = React.memo(
  ({ data, buttonText, onOpenModal }: PearlBodyProps) => {
    return (
      <div className={styles.pearlBody}>
        <Title data={data} className={styles.pearlTitle} />
        <Authors data={data} className={styles.pearlAuthor} />
        <div className={styles.pearlMeta}>
          <Price data={data} className={styles.pearlPrice} />
        </div>
        <button
          type="button"
          className={styles.pearlTake}
          onClick={onOpenModal}
        >
          {buttonText}
        </button>
      </div>
    );
  },
);
PearlBody.displayName = "PearlBody";
