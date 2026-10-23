"use client";

import React, { useState } from "react";
import Image from "next/image";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import {
  PERSONA_DICTIONARY,
  PersonaItem,
} from "@/constants/main/AiReviewSelect";
import { useModalStack } from "@/components/hook/useContextModal";
import { usePersona } from "@/components/Context/usePersonaContext";

export default function PersonaSelectModal() {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const { selectedPersonaId, setSelectedPersonaId } = usePersona();

  const dict = PERSONA_DICTIONARY[lang || "ko"];
  const personas: PersonaItem[] = dict?.personas || [];

  // 호버 중인 페르소나 (기본값은 현재 선택된 페르소나)
  const [hoveredPersona, setHoveredPersona] = useState<PersonaItem | null>(
    () =>
      personas.find((p) => p.id === selectedPersonaId) || personas[0] || null,
  );

  const activeDisplayPersona =
    hoveredPersona ||
    personas.find((p) => p.id === selectedPersonaId) ||
    personas[0];

  const handleSelectPersona = (id: string) => {
    setSelectedPersonaId(id);
    closeModal();
  };

  return (
    <div className={classNames(styles.modalOverlay, styles.open)}>
      <motion.div
        className={styles.modalContainer}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeModal}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <span className={styles.eyebrow}>CURATOR ARCHIVE</span>
          <h2 className={styles.title}>SELECT YOUR PERSPECTIVE</h2>
        </div>

        {/* 메인 레이아웃: 좌측 구슬 리스트 & 우측 설명 패널 */}
        <div className={styles.contentGrid}>
          {/* 좌측: 구슬 셀렉터 영역 */}
          <div className={styles.orbGrid}>
            {personas.map((persona) => {
              const isSelected = persona.id === selectedPersonaId;

              return (
                <button
                  key={persona.id}
                  type="button"
                  className={classNames(styles.orbWrapper, {
                    [styles.selected]: isSelected,
                  })}
                  onClick={() => handleSelectPersona(persona.id)}
                  onMouseEnter={() => setHoveredPersona(persona)}
                  onMouseLeave={() => setHoveredPersona(null)}
                >
                  {/* 구슬 본체 */}
                  <div className={styles.orb}>
                    <div className={styles.orbInner}>
                      {persona.imageSrc ? (
                        <Image
                          src={persona.imageSrc}
                          alt={persona.name}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.orbFallback} />
                      )}
                    </div>

                    {/* 유리 질감 반사 & 글로우 레이어 */}
                    <div className={styles.glassShine} />
                    <div className={styles.orbRing} />
                  </div>

                  {/* 하단 캡션 */}
                  <span className={styles.orbLabel}>{persona.name}</span>
                </button>
              );
            })}
          </div>

          {/* 우측: 페르소나 상세 스펙 패널 */}
          <div className={styles.detailPanel}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDisplayPersona?.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={styles.detailCard}
              >
                <div className={styles.roleBadge}>
                  {activeDisplayPersona?.roleTag}
                </div>
                <h3 className={styles.personaTitle}>
                  {activeDisplayPersona?.name}
                </h3>

                <p className={styles.description}>
                  {activeDisplayPersona?.description}
                </p>

                {/* 선호 장르 */}
                {activeDisplayPersona?.preferredGenres?.length > 0 && (
                  <div className={styles.genreTags}>
                    {activeDisplayPersona.preferredGenres.map((genre, idx) => (
                      <span key={idx} className={styles.tag}>
                        #{genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* 대표 대사 */}
                {activeDisplayPersona?.quotes?.[0] && (
                  <div className={styles.quoteBlock}>
                    <span className={styles.quoteMark}>&ldquo;</span>
                    <p className={styles.quoteText}>
                      {activeDisplayPersona.quotes[0]}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
