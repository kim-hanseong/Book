"use client";

import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { usePersona } from "@/components/Context/usePersonaContext";
import {
  PERSONA_DICTIONARY,
  PersonaItem,
} from "@/constants/main/AiReviewSelect";

import { AiThumbnail } from "@/components/common/AiReviewer/ReviewerThumbnail";
import { AiTitle } from "@/components/common/AiReviewer/ReviewerTitle";

interface DictionaryLabels {
  traits: string;
  genres: string;
  quotes: string;
  preview: string;
}

/**
 * ==========================================
 * Main Persona Archive Container
 * ==========================================
 */
export default function PersonaSection() {
  const { lang } = useLanguage();
  const dict = PERSONA_DICTIONARY[lang];

  // Context 전역 상태 (최종 선택된 페르소나 ID)
  const { selectedPersonaId, setSelectedPersonaId } = usePersona();

  // Local State (상단 아바타 클릭 시 미리보기용 ID)
  const [previewId, setPreviewId] = useState<string>("");

  // 초기 선택값 및 Context 기본값 매핑
  useEffect(() => {
    const defaultId = selectedPersonaId || dict.personas[0]?.id || "";
    setPreviewId(defaultId);
    if (!selectedPersonaId && defaultId) {
      setSelectedPersonaId(defaultId);
    }
  }, [dict, selectedPersonaId, setSelectedPersonaId]);

  // 현재 미리보기 중인 페르소나 객체
  const selectedPersona =
    dict.personas.find((p: PersonaItem) => p.id === previewId) ||
    dict.personas[0];

  /** 상단 아바타 클릭: 미리보기 스위칭 */
  const handlePreviewPersona = (id: string) => {
    setPreviewId(id);
  };

  /** 하단 버튼 클릭: 전역 Context 페르소나 확정 */
  const handleConfirmPersona = (id: string) => {
    setSelectedPersonaId(id);
  };

  if (!selectedPersona) return null;

  return (
    <div className={styles.page}>
      <div className={styles.grain} />

      {/* 1. 헤더 영역 */}
      <div className={styles.pageHead}>
        <div className={styles.eyebrow}>{dict.eyebrow}</div>
        <h2>{dict.title}</h2>
        <p>{dict.description}</p>
      </div>

      {/* 2. 상단 아바타 셀렉터 */}
      <div className={styles.selector}>
        {dict.personas.map((p: PersonaItem) => (
          <button
            key={p.id}
            type="button"
            className={classNames(styles.avatarBtn, {
              [styles.active]: p.id === previewId,
            })}
            onClick={() => handlePreviewPersona(p.id)}
          >
            <div className={styles.avatarRing}>
              <AiThumbnail src={p.imageSrc} w={68} h={68} />
              <span className={styles.pulseRing} />
            </div>
            <AiTitle data={p} className={styles.avatarName} />
          </button>
        ))}
      </div>

      {/* 3. 메인 상세 프로필 패널 */}
      <div className={styles.panel}>
        <PersonaPortrait
          persona={selectedPersona}
          isSelected={selectedPersona.id === selectedPersonaId}
          onConfirmSelect={handleConfirmPersona}
        />
        <PersonaDetails persona={selectedPersona} labels={dict.labels} />
      </div>
    </div>
  );
}

/**
 * ==========================================
 * Sub Components
 * ==========================================
 */

/** [초상화 컬럼] 카드 이미지 + 확정 선택 버튼 */
function PersonaPortrait({
  persona,
  isSelected,
  onConfirmSelect,
}: {
  persona: PersonaItem;
  isSelected: boolean;
  onConfirmSelect: (id: string) => void;
}) {
  const { lang } = useLanguage();
  const dict = PERSONA_DICTIONARY[lang];

  return (
    <div className={styles.portraitCol}>
      <div className={styles.portraitFrame}>
        <AnimatePresence mode="wait">
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <AiThumbnail src={persona.imageSrc} w={280} h={370} />
          </motion.div>
        </AnimatePresence>
        <div className={styles.vignette} />
        <div className={styles.stamp}>{persona.code}</div>
      </div>

      <div className={styles.roleTag}>{persona.roleTag}</div>
      <div className={styles.personaName}>{persona.name}</div>

      {/* 선택 / 변경 버튼 */}
      <button
        type="button"
        className={classNames(styles.selectBtn, {
          [styles.selectedBtn]: isSelected,
        })}
        onClick={() => onConfirmSelect(persona.id)}
      >
        {isSelected ? (dict.selected ?? "변경됨") : (dict.select ?? "변경")}
      </button>
    </div>
  );
}

/** [상세 정보 컬럼] 특징, 장르, 대사, 추천 스타일 */
function PersonaDetails({
  persona,
  labels,
}: {
  persona: PersonaItem;
  labels: DictionaryLabels;
}) {
  return (
    <div className={styles.detailCol}>
      {/* 특징 및 설명 */}
      <div className={styles.fieldBlock}>
        <div className={styles.fieldLabel}>
          <span className={styles.dot} />
          {labels.traits}
        </div>
        <div className={styles.traitBox}>
          <div className={styles.traitText}>{persona.description}</div>
        </div>
      </div>

      {/* 선호 장르 태그 */}
      {persona.preferredGenres && persona.preferredGenres.length > 0 && (
        <div className={styles.fieldBlock}>
          <div className={styles.fieldLabel}>
            <span className={styles.dot} />
            {labels.genres}
          </div>
          <div className={styles.genreList}>
            {persona.preferredGenres.map((genre, idx) => (
              <span key={idx} className={styles.genreTag}>
                #{genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 대표 대사 */}
      <div className={styles.fieldBlock}>
        <div className={styles.fieldLabel}>
          <span className={styles.dot} />
          {labels.quotes}
        </div>
        <div className={styles.quoteList}>
          {persona.quotes.map((q, idx) => (
            <div
              key={`${persona.id}-quote-${idx}`}
              className={styles.quoteItem}
            >
              <div className={styles.quoteText}>{q}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 추천 스타일 미리보기 */}
      <div className={styles.fieldBlock}>
        <div className={styles.fieldLabel}>
          <span className={styles.dot} />
          {labels.preview}
        </div>
        <div className={styles.previewBox}>
          <div className={styles.previewOrb}>
            <svg viewBox="0 0 24 24">
              <path d="M3 6c3-1.6 6-1.6 9 0 3-1.6 6-1.6 9 0v13c-3-1.6-6-1.6-9 0-3-1.6-6-1.6-9 0Z" />
            </svg>
          </div>
          <div className={styles.previewText}>
            {persona.recommendationPreview}
          </div>
        </div>
      </div>
    </div>
  );
}
