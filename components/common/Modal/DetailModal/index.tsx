"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { LikeButton } from "../../button/LikeBtn";
import { BuyButton } from "../../button/BuyBtn";
import KarmaRating from "../../Rating";
import AuthButton from "../../button/AuthBtn";
import PersonaSelectModal from "../GlobalModal/SelectReviewerModal";
import { Thumbnail } from "../../Product/Thumbnail";
import { Title } from "../../Product/Title";
import { Contents } from "../../Product/Contents";
import { Price } from "../../Product/Price";
import { Created } from "../../Product/Created";
import { AiThumbnail } from "../../AiReviewer/ReviewerThumbnail";
import { Authors } from "../../Product/Authors";

import styles from "./index.module.css";

import { useAiReview } from "@/components/hook/useAiReview";
import { DETAIL_MODAL_DICTIONARY } from "@/constants/common/Modal/DetailModal/detailModal";
import { fetchPostByTitleAndThumbnail } from "@/lib/supabase/supabase";
import { usePersona } from "@/components/Context/usePersonaContext";
import {
  PERSONA_DICTIONARY,
  PersonaItem,
} from "@/constants/main/AiReviewSelect";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { useModalStack } from "@/components/hook/useContextModal";
import { Book } from "@/types/book";
import { ReadRating } from "@/lib/api/ratingAction";
import { AiReviewItem } from "@/types/aireviewitem";
import { useMatchedPersona } from "@/components/hook/useMatchedPersona";

interface DetailModalProps {
  data: Book;
}

export default function DetailModal({ data }: DetailModalProps) {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const currentLang = lang || "ko";
  const t = DETAIL_MODAL_DICTIONARY[currentLang];

  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const isClosingRef = useRef(false);

  const { selectedPersonaId } = usePersona();
  const dict = PERSONA_DICTIONARY[currentLang];

  const activePersona: PersonaItem = useMemo(() => {
    return (
      dict?.personas.find((p: PersonaItem) => p.id === selectedPersonaId) ||
      dict?.personas[0]
    );
  }, [dict, selectedPersonaId]);

  const authorText = useMemo(() => {
    return Array.isArray(data?.authors)
      ? data.authors.join(", ")
      : data?.authors || t.unknownAuthor;
  }, [data?.authors, t.unknownAuthor]);

  // AI 리뷰 훅
  const {
    reviewStatus,
    displayedText,
    personaRating,
    handleGenerateReview,
    stopTyping,
  } = useAiReview({
    bookData: data,
    authorText,
    lang: currentLang,
    activePersona,
    selectedPersonaId,
    fallbackText: t.errorReviewFallback,
  });

  // 리뷰 히스토리 조회 Query
  const { data: historyList = [], isLoading: isHistoryLoading } = useQuery<
    AiReviewItem[]
  >({
    queryKey: ["reviews", data?.title, data?.isbn],
    queryFn: async () => {
      if (!data?.title || !data?.isbn) return [];
      const postData = await fetchPostByTitleAndThumbnail(
        data.title,
        data.isbn,
      );

      return postData || [];
    },
    enabled: !!data?.title && !!data?.isbn,
    staleTime: 1000 * 60 * 5,
  });

  // 평점 조회 Query
  // 💡 useQuery<number> -> useQuery<number[]>로 수정합니다.
  const { data: ratingData = { averageRating: 0 } } = useQuery<{
    averageRating: number;
  }>({
    queryKey: ["rating", data?.title, data?.isbn],
    queryFn: async (): Promise<{ averageRating: number }> => {
      if (!data?.title || !data?.isbn) return { averageRating: 0 };

      const postData = await ReadRating(data.title, data.isbn);

      // 2. 어떤 값이 오든 무조건 number로 치환해서 객체로 반환합니다.
      return {
        averageRating: postData?.averageRating ?? postData?.average ?? 0,
      };
    },
    enabled: !!data?.title && !!data?.isbn,
    staleTime: 1000 * 60 * 5,
  });
  const handleSafeClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    stopTyping();
    closeModal();
  }, [stopTyping, closeModal]);

  const personaList = useMemo(() => ["ALL"], []);

  return (
    <div className={classNames(styles.modalContainer, styles.open)}>
      <button
        type="button"
        className={styles.modalClose}
        onClick={handleSafeClose}
        aria-label="Close modal"
      >
        ✕
      </button>
      <div className={styles.mainPanel}>
        <BookInfoCard data={data} totalRating={ratingData || 0} />

        <CuratorSection
          selectedPersona={activePersona}
          reviewStatus={reviewStatus}
          personaRating={personaRating}
          displayedText={displayedText}
          onGenerateReview={handleGenerateReview}
        />
      </div>

      <ReviewHistoryPanel
        historyList={historyList}
        personaList={personaList}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        isLoading={isHistoryLoading}
      />
    </div>
  );
}

// ==========================================
// Sub Components (React.memo 최적화 적용)
// ==========================================

interface BookInfoCardProps {
  data: Book;
  totalRating?: {
    averageRating: number;
  };
}

const BookInfoCard = React.memo(function BookInfoCard({
  data,
  totalRating,
}: BookInfoCardProps) {
  const { lang } = useLanguage();
  const t = DETAIL_MODAL_DICTIONARY[lang || "ko"];
  const { closeModal } = useModalStack();

  const handleLinkClick = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return (
    <div className={styles.bookCard}>
      <div className={styles.modalCover}>
        <Thumbnail data={data} w={150} h={220} />
      </div>

      <div className={styles.modalInfo}>
        <div className={styles.modalRegion}>PEARL COLLECTION</div>
        <Title data={data} className={styles.modalTitle} />
        <Authors data={data} className={styles.modalAuthor} />
        <KarmaRating rating={totalRating?.averageRating || 0} />
        <Contents data={data} className={styles.modalDesc} />
        <div className={styles.modalRow}>
          <Price data={data} className={styles.modalTotal} />
        </div>

        <div className={styles.modalActions}>
          <div className={styles.modalBtnGroup}>
            <LikeButton data={data} className={styles.modalIconBtn} />
            <BuyButton data={data} className={styles.modalIconBtn} />
          </div>

          <div className={styles.modalDetailBtn}>
            <Link
              href={`/test/${encodeURIComponent(data.isbn)}/${encodeURIComponent(
                data.title,
              )}`}
              className={styles.btnExplore}
              onClick={handleLinkClick}
            >
              {t.exploreBtn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

interface CuratorSectionProps {
  selectedPersona: PersonaItem | null;
  reviewStatus: "idle" | "loading" | "success" | "error";
  personaRating: number | null;
  displayedText: string;
  onGenerateReview: () => void;
}

const CuratorSection = React.memo(function CuratorSection({
  selectedPersona,
  reviewStatus,
  personaRating,
  displayedText,
  onGenerateReview,
}: CuratorSectionProps) {
  const { lang } = useLanguage();
  const t = DETAIL_MODAL_DICTIONARY[lang || "ko"];
  const { openModal } = useModalStack();

  const handleOpenSearchModal = useCallback(() => {
    if (reviewStatus === "loading") return;
    openModal("persona-modal", <PersonaSelectModal />);
  }, [reviewStatus, openModal]);

  const curatorName = selectedPersona?.name || t.defaultCuratorName;

  return (
    <div className={styles.curatorSection}>
      <div className={styles.curatorHeader}>
        <div className={styles.curatorProfile}>
          <button
            type="button"
            className={classNames(styles.avatarWrap, {
              [styles.avatarDisabled]: reviewStatus === "loading",
            })}
            onClick={handleOpenSearchModal}
            disabled={reviewStatus === "loading"}
            title={
              reviewStatus === "loading"
                ? "생성 중에는 캐릭터를 변경할 수 없습니다."
                : "캐릭터 변경"
            }
          >
            <Image
              src={selectedPersona?.imageSrc || "/야독.png"}
              width={52}
              height={52}
              alt={curatorName}
              style={{ objectFit: "cover" }}
            />
          </button>
          <div className={styles.curatorTextInfo}>
            <span className={styles.curatorName}>{curatorName}</span>
            <span className={styles.curatorRole}>
              {selectedPersona?.roleTag || t.defaultCuratorRole}
            </span>
            <AuthButton
              type="button"
              className={classNames(styles.btnGenerateReview, {
                [styles.loadingBtn]: reviewStatus === "loading",
              })}
              onClick={onGenerateReview}
              disabled={reviewStatus === "loading"}
            >
              {reviewStatus === "loading" ? (
                <span className={styles.dotsLoader}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              ) : (
                t.requestAiReview
              )}
            </AuthButton>
          </div>
        </div>

        {reviewStatus === "success" && personaRating !== null && (
          <div className={styles.curatorRatingWrap}>
            <KarmaRating
              key={`persona-${personaRating}`}
              rating={personaRating}
            />
          </div>
        )}
      </div>

      <div className={styles.curatorBody}>
        {reviewStatus === "idle" && (
          <div className={styles.idleState}>
            <p className={styles.idleHint}>{t.idleHint(curatorName)}</p>
          </div>
        )}

        {reviewStatus === "loading" && (
          <div className={styles.skeletonBox}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLineShort} />
          </div>
        )}

        {reviewStatus === "success" && (
          <div className={styles.reviewContentWrap}>
            <div className={styles.reviewContent}>
              <span className={styles.quote}>&ldquo;</span>
              <span className={styles.reviewText}>{displayedText}</span>
              <span className={styles.caret} />
              <span className={styles.quote}>&rdquo;</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

interface ReviewHistoryPanelProps {
  historyList: AiReviewItem[];
  personaList: string[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
  isLoading?: boolean;
}

export const ReviewHistoryPanel = React.memo(function ReviewHistoryPanel({
  historyList,
  personaList,
  selectedFilter,
  onFilterSelect,
  isLoading,
}: ReviewHistoryPanelProps) {
  const { lang } = useLanguage();
  const currentLang = lang || "ko";
  const t = DETAIL_MODAL_DICTIONARY[currentLang];

  const filteredHistory = useMemo(() => {
    return selectedFilter === "ALL"
      ? historyList
      : historyList.filter(
          (r) =>
            r.personaName === selectedFilter || r.reviewer === selectedFilter,
        );
  }, [historyList, selectedFilter]);

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <div className={styles.historyTitleWrap}>
          <span className={styles.archiveBadge}>{t.archiveBadge}</span>
          <h3 className={styles.historyTitle}>{t.historyTitle}</h3>
        </div>
        <span className={styles.historyCount}>{filteredHistory.length}</span>
      </div>

      <div className={styles.filterBar}>
        {personaList.map((pName, idx) => (
          <button
            key={idx}
            type="button"
            className={classNames(styles.filterChip, {
              [styles.active]: selectedFilter === pName,
            })}
            onClick={() => onFilterSelect(pName)}
          >
            {pName === "ALL" ? t.filterAll : pName}
          </button>
        ))}
      </div>

      <div className={styles.historyList}>
        {isLoading ? (
          <div className={styles.historySkeletonWrap}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.historySkeletonCard}>
                <div className={styles.skeletonHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonName} />
                </div>
                <div className={styles.skeletonBody} />
              </div>
            ))}
          </div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory
            .slice(0, 3)
            .map((item) => <HistoryCardItem key={item.id} item={item} />)
        ) : (
          <div className={styles.emptyArchiveState}>
            <div className={styles.emptyIconWrap}>💬</div>
            <p className={styles.emptyTitle}>
              {currentLang === "ko"
                ? "아직 기록된 리뷰가 없습니다"
                : "No Reviews Yet"}
            </p>
            <p className={styles.emptySub}>
              {currentLang === "ko"
                ? "상단의 AI 큐레이터에게 첫 번째 리뷰 작성을 요청해보세요!"
                : "Ask the AI Curator above to write the first review!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// 💡 각각의 아이템을 독립된 컴포넌트로 분리
const HistoryCardItem = React.memo(function HistoryCardItem({
  item,
}: {
  item: AiReviewItem;
}) {
  const matchedPersona = useMatchedPersona(item.reviewer);

  // 💡 2. truncatedComment가 외부 변수라면 item 안의 코멘트로 안전하게 처리
  const truncatedComment = item.Comment; // 필요에 따라 .slice() 등으로 자르기

  return (
    // 💡 3. key는 map을 도는 부모(HistoryCardItem)에 있으므로 내부 div의 key는 제거합니다.
    <div className={styles.historyItemCard}>
      <div className={styles.itemHeader}>
        <div className={styles.itemPersona}>
          <AiThumbnail
            data={matchedPersona}
            w={26}
            h={26}
            className={styles.itemAvatar}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* 💡 4. matchedPersona가 null일 수 있으므로 옵셔널 체이닝(?.) 적용 */}
            <span className={styles.itemName}>{matchedPersona?.name}</span>
          </div>
        </div>

        <div className={styles.itemScoreWrap}>
          <KarmaRating rating={item.rating} size={32} />
        </div>
      </div>

      <p className={styles.itemReviewText}>&ldquo;{truncatedComment}&rdquo;</p>

      <Created data={item} className={styles.itemDate} />
    </div>
  );
});
