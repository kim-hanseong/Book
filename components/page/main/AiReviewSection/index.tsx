"use client";

import Image from "next/image";
import React from "react";

import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { AI_REVIEW_SECTION_DICTIONARY } from "@/constants/main/AiReview";

export default function AiReviewSection() {
  const { lang } = useLanguage();
  const t = AI_REVIEW_SECTION_DICTIONARY[lang];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>{t.badge}</span>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </div>

      {/* AI Review Display Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            overflow: "hidden", // 카드 범위를 넘지 않게 자름
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src="/mainpage.png"
            alt={t.imageAlt}
            width={732}
            height={1116}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}
