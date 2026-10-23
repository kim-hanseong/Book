"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import classNames from "classnames";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Types
import styles from "./index.module.css";

import { Book } from "@/types/book";
import { AiReviewItem } from "@/types/aireviewitem";

// Constants & Supabase API
import { DETAIL_MODAL_DICTIONARY } from "@/constants/common/Modal/DetailModal/detailModal";
import {
  PERSONA_DICTIONARY,
  PersonaItem,
} from "@/constants/main/AiReviewSelect";
import { FOCUS_NAV, FOCUS_SECTION_DICTIONARY } from "@/constants/focus/Focus";
import { fetchPostByTitleAndThumbnail } from "@/lib/supabase/supabase";
import { DeletePost, ReadPost } from "@/lib/api/postAction";

// Styles
import { useLanguage } from "@/components/hook/useContextLanguge";
import { usePersona } from "@/components/Context/usePersonaContext";
import { useModalStack } from "@/components/hook/useContextModal";
import { useAiReview } from "@/components/hook/useAiReview";
import { ReviewModal } from "@/components/common/Modal/CommentModal";
import LoadingModal from "@/components/common/Modal/GlobalModal/LadingAralm";
import CommentDeleteModal from "@/components/common/Modal/Arlam/Comment/DeleteAralm";
import ErrorModal from "@/components/common/Modal/GlobalModal/ErrorModal";
import AuthButton from "@/components/common/button/AuthBtn";
import PersonaSelectModal from "@/components/common/Modal/GlobalModal/SelectReviewerModal";
import { Contents } from "@/components/common/Product/Contents";
import KarmaRating from "@/components/common/Rating";
import { useMatchedPersona } from "@/components/hook/useMatchedPersona";
import { AiThumbnail } from "@/components/common/AiReviewer/ReviewerThumbnail";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import { Authors } from "@/components/common/Product/Authors";
import { AiTitle } from "@/components/common/AiReviewer/ReviewerTitle";
import { useSupabase } from "@/components/Auth/AuthProvider";
import { Created } from "@/components/common/Product/Created";
import { Price } from "@/components/common/Product/Price";
import { LikeButton } from "@/components/common/button/LikeBtn";
import { BuyButton } from "@/components/common/button/BuyBtn";
import { comment } from "@/types/comment";
import { UserReviewerStatItem } from "@/lib/api/userAiState";

// ======================================================
// Types & Interfaces
// ======================================================

interface CuratorSectionProps {
  selectedPersona?: PersonaItem;
  reviewStatus: "idle" | "loading" | "success" | "error";
  personaRating: number | null;
  displayedText: string;
  onGenerateReview: () => void;
}

interface FocusPageProps {
  data: Book;
  AiReviewData: AiReviewItem[];
  CommentData: comment[];
  UserState: UserReviewerStatItem[];
  TotalRating: { averageRating: number };
}

// ======================================================
// Helper Functions
// ======================================================

function formatDate(datetime?: Date) {
  if (!datetime) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(datetime));
}

// ======================================================
// Main Page Component
// ======================================================

export default function FocusPage({
  data,
  AiReviewData,
  CommentData,
  UserState,
  TotalRating,
}: FocusPageProps) {
  const queryClient = useQueryClient();

  const { lang } = useLanguage();
  const { selectedPersonaId } = usePersona();
  const { openModal, closeModal } = useModalStack();

  const currentLang = lang || "ko";
  const t = DETAIL_MODAL_DICTIONARY[currentLang];
  const td = FOCUS_SECTION_DICTIONARY[currentLang];
  const dict = PERSONA_DICTIONARY[currentLang];

  const selectedPersona: PersonaItem = useMemo(() => {
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

  const { reviewStatus, displayedText, personaRating, handleGenerateReview } =
    useAiReview({
      bookData: data,
      authorText,
      lang: currentLang,
      activePersona: selectedPersona,
      selectedPersonaId,
      fallbackText: t.errorReviewFallback,
    });

  // 1. AI 큐레이터 리뷰 목록 조회 (staleTime 적용으로 트래픽 방어)
  const { data: aiReviewList = [], isLoading: isAiReviewLoading } = useQuery<
    AiReviewItem[]
  >({
    queryKey: ["ai-reviews", data?.title, data?.isbn],
    queryFn: async () => {
      if (!data?.title || !data?.isbn) return [];
      const postData = await fetchPostByTitleAndThumbnail(
        data.title,
        data.isbn,
      );

      return postData || [];
    },
    initialData: AiReviewData,
    placeholderData: AiReviewData,
    enabled: !!data?.title && !!data?.isbn,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 2. 일반 독자(Human) 댓글/리뷰 목록 조회
  const { data: userCommentList = [], isLoading: isUserCommentLoading } =
    useQuery<comment[]>({
      queryKey: ["user-comments", data?.title, data.isbn],
      queryFn: async () => {
        if (!data?.title || !data?.isbn) return [];
        const postData = await ReadPost(data.title, data.isbn);

        return postData || [];
      },
      initialData: CommentData,
      placeholderData: CommentData,
      enabled: !!data?.title && !!data?.isbn,
      staleTime: 1000 * 60 * 5, // 5분
    });

  const handleOpenReviewModal = useCallback(() => {
    openModal("review-modal", <ReviewModal data={data} />);
  }, [openModal, data]);

  const handleDeleteComment = useCallback(
    (commentId: number) => {
      openModal(
        "delete-confirm-modal",
        <CommentDeleteModal
          onConfirm={async () => {
            openModal("loading", <LoadingModal />);
            const { error } = await DeletePost(commentId);

            closeModal();

            if (error) {
              openModal("loading", <ErrorModal />);

              return;
            }

            await queryClient.invalidateQueries({
              queryKey: ["user-comments", data?.title, data.isbn],
            });
          }}
        />,
      );
    },
    [openModal, closeModal, queryClient, data?.title, data?.isbn],
  );

  return (
    <main className={styles.focusPage}>
      <Navigation />

      <FocusCuratorSection
        data={data}
        AiReviewData={aiReviewList}
        TotalRating={TotalRating}
      />

      <section className={styles.section}>
        <SectionHeader eyebrow="BOOK SPECS" title={td.bookSpecs.title} />
        <BookSpecGrid data={data} />
      </section>

      <section id="book-content" className={styles.section}>
        <SectionHeader
          eyebrow="SYNOPSIS & CONTENTS"
          title={td.bookContent.title}
        />
        <Contents data={data} className={styles.archiveCard} />
      </section>

      <section id="archive" className={styles.section}>
        <SectionHeader
          eyebrow="ARCHIVE"
          title={td.archive.title}
          description={td.archive.description}
        />

        <CuratorSection
          selectedPersona={selectedPersona}
          reviewStatus={reviewStatus}
          personaRating={personaRating}
          displayedText={displayedText}
          onGenerateReview={handleGenerateReview}
        />

        <div className={styles.archiveBlock}>
          <AIReviewHeader AiReviewList={aiReviewList} />
          <div className={styles.archiveList}>
            {isAiReviewLoading ? (
              <ReviewPanelLoading />
            ) : aiReviewList.length > 0 ? (
              <AIReviewPanelList aiReviewList={aiReviewList} />
            ) : (
              <AIReviewPanelEmpty />
            )}
          </div>
        </div>

        <div className={styles.archiveBlock}>
          <div className={styles.archiveBlockHeader}>
            <div>
              <span className={styles.humanBadge}>READER COMMENTS</span>
              <div className={styles.flexWrap}>
                <h3>{td.readerComments.title}</h3>
                <span className={styles.historyCount}>
                  {CommentData.length}
                </span>
              </div>
            </div>
            <div className={styles.archiveBlockActions}>
              <AuthButton
                type="button"
                className={styles.reviewButton}
                onClick={handleOpenReviewModal}
              >
                <span>{td.readerComments.reviewButton}</span>
                <span className={styles.reviewArrow}>↗</span>
              </AuthButton>
            </div>
          </div>
          {userCommentList?.length > 0 ? (
            <ReaderCommentsSection
              comment={userCommentList}
              userstate={UserState}
              onDelete={handleDeleteComment}
            />
          ) : isUserCommentLoading ? (
            <ReviewPanelLoading />
          ) : (
            <ReaderCommentsEmpty />
          )}
        </div>
      </section>

      <StickyBar data={data} />
    </main>
  );
}

// ======================================================
// Sub Components (최적화 적용된 메모이제이션 컴포넌트)
// ======================================================

const Navigation = React.memo(() => {
  const { lang } = useLanguage();
  const currentLang = lang || "ko";
  const focusNav = FOCUS_NAV[currentLang];

  return (
    <nav className={styles.subNav}>
      <div className={styles.subNavInner}>
        <span className={styles.subNavBrand}>BOOK FOCUS</span>
        <div className={styles.subNavLinks}>
          {focusNav.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={styles.subNavLink}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";

const SectionHeader = React.memo(
  ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow: string;
    title: string;
    description?: string;
  }) => {
    return (
      <header className={styles.sectionHeader}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
    );
  },
);

SectionHeader.displayName = "SectionHeader";

const BookSpecGrid = React.memo(({ data }: { data: Book }) => {
  const specs = useMemo(
    () => [
      ["출판사", data.publisher],
      ["출간일", formatDate(data.datetime)],
      ["ISBN", data.isbn],
    ],
    [data.publisher, data.datetime, data.isbn],
  );

  return (
    <div className={styles.specGrid}>
      {specs.map(([label, value]) => (
        <div key={label} className={styles.specCard}>
          <span>{label}</span>
          <strong>{value || "-"}</strong>
        </div>
      ))}
    </div>
  );
});

BookSpecGrid.displayName = "BookSpecGrid";

const CuratorSection = React.memo(
  ({
    selectedPersona,
    reviewStatus,
    personaRating,
    displayedText,
    onGenerateReview,
  }: CuratorSectionProps) => {
    const { lang } = useLanguage();
    const currentLang = lang || "ko";
    const t = DETAIL_MODAL_DICTIONARY[currentLang];
    const { openModal } = useModalStack();

    const handleOpenSearchModal = useCallback(() => {
      if (reviewStatus === "loading") return;
      openModal("persona-modal", <PersonaSelectModal />);
    }, [reviewStatus, openModal]);

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
                alt={selectedPersona?.name || t.defaultCuratorName}
                style={{ objectFit: "cover" }}
              />
            </button>
            <div className={styles.curatorTextInfo}>
              <span className={styles.curatorName}>
                {selectedPersona?.name || t.defaultCuratorName}
              </span>
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
              <p className={styles.idleHint}>
                {t.idleHint(selectedPersona?.name || t.defaultCuratorName)}
              </p>
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
  },
);

CuratorSection.displayName = "CuratorSection";

const UserAiStateItem = React.memo(
  ({ item }: { item: UserReviewerStatItem }) => {
    const matchedPersona = useMatchedPersona(item.reviewer);
    const personaAvatar = matchedPersona?.imageSrc || "/야독.png";

    return (
      <div className={styles.reviewerAvatar}>
        <AiThumbnail
          src={personaAvatar}
          w={32}
          h={32}
          className={styles.reviewerThumbnail}
        />
      </div>
    );
  },
);

UserAiStateItem.displayName = "UserAiStateItem";

const UserAiState = React.memo(({ list }: { list: UserReviewerStatItem[] }) => {
  return (
    <div className={styles.reviewerAvatarStack}>
      {list.slice(0, 3).map((item) => (
        <UserAiStateItem key={item.reviewer || item.id} item={item} />
      ))}
    </div>
  );
});

UserAiState.displayName = "UserAiState";

const FocusCuratorSection = React.memo(
  ({
    data,
    AiReviewData,
    TotalRating,
  }: {
    data: Book;
    AiReviewData: AiReviewItem[];
    TotalRating: { averageRating: number };
  }) => {
    const uniqueCuratorList = useMemo(() => {
      const curatorList = AiReviewData.filter((item) => item.rating >= 4).slice(
        0,
        3,
      );

      return Array.from(
        new Map(curatorList.map((item) => [item.reviewer, item])).values(),
      );
    }, [AiReviewData]);

    const { lang } = useLanguage();
    const td = FOCUS_SECTION_DICTIONARY[lang || "ko"];

    return (
      <section id="detail" className={styles.heroSection}>
        <div className={styles.heroInner}>
          <Thumbnail data={data} w={280} h={400} className={styles.heroCover} />
          <div className={styles.heroInfo}>
            <span className={styles.eyebrow}>BOOK DETAIL</span>
            <Title data={data} className={styles.bookTitle} />
            <Authors data={data} className={styles.bookAuthor} />
            <KarmaRating
              rating={TotalRating.averageRating}
              className={styles.bookRating}
            />
            {uniqueCuratorList.length > 0 ? (
              <>
                <p className={styles.bookCuratorInfo}>{td.curatorFocus}</p>
                <FocusCuratorList curatorList={uniqueCuratorList} />
              </>
            ) : (
              <FocusCuratorEmpty />
            )}
          </div>
        </div>
      </section>
    );
  },
);

FocusCuratorSection.displayName = "FocusCuratorSection";

const FocusCuratorList = React.memo(
  ({ curatorList }: { curatorList: AiReviewItem[] }) => {
    return (
      <div className={styles.ratingRow}>
        <div className={styles.revieTool}>
          {curatorList.map((item, index) => (
            <FocusCuratorItem key={`${item.id}-${index}`} persona={item} />
          ))}
        </div>
      </div>
    );
  },
);

FocusCuratorList.displayName = "FocusCuratorList";

const FocusCuratorItem = React.memo(
  ({ persona }: { persona: AiReviewItem }) => {
    const matchedPersona = useMatchedPersona(persona.reviewer);

    return (
      <div className={styles.reviewWrap}>
        <AiThumbnail
          src={matchedPersona?.imageSrc}
          w={50}
          h={50}
          className={styles.itemAvatar}
        />
        <div className={styles.itemInfo}>
          <AiTitle data={matchedPersona} className={styles.itemName} />
        </div>
        <KarmaRating rating={persona.rating} size={28} />
      </div>
    );
  },
);

FocusCuratorItem.displayName = "FocusCuratorItem";

const FocusCuratorEmpty = React.memo(() => {
  const { lang } = useLanguage();

  return (
    <div className={styles.curatorEmpty}>
      <span>
        {lang === "en"
          ? "No AI curators have reviewed this book yet."
          : "아직 이 책을 리뷰한 AI 큐레이터가 없습니다."}
      </span>
    </div>
  );
});

FocusCuratorEmpty.displayName = "FocusCuratorEmpty";

const ReaderCommentsSection = React.memo(
  ({
    comment,
    userstate,
    onDelete,
  }: {
    comment: comment[];
    userstate: UserReviewerStatItem[];
    onDelete: (commentId: number) => void;
  }) => {
    const { session } = useSupabase();
    const currentUserId = session?.user?.id;
    const { lang } = useLanguage();

    return (
      <div className={styles.archiveList}>
        {comment.slice(0, 5).map((item) => {
          const isOwner = Boolean(
            currentUserId && item.user_id === currentUserId,
          );

          return (
            <article key={item.id} className={styles.commentCard}>
              <header className={styles.commentHeader}>
                <div className={styles.userInfo}>
                  <strong className={styles.userEmail}>{item.email}</strong>
                  <Created data={item} className={styles.ReaderitemDate} />
                </div>

                <div className={styles.headerRight}>
                  <KarmaRating rating={item.rating} size={28} readOnly />
                  {isOwner && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => onDelete(item.id)}
                    >
                      {lang === "en" ? "Delete" : "삭제"}
                    </button>
                  )}
                </div>
              </header>

              <div className={styles.commentBody}>
                <p className={styles.commentText}>{item.Comment}</p>
              </div>

              <footer className={styles.commentFooter}>
                <UserAiState list={userstate} />
              </footer>
            </article>
          );
        })}
      </div>
    );
  },
);

ReaderCommentsSection.displayName = "ReaderCommentsSection";

const ReaderCommentsEmpty = React.memo(() => {
  const { lang } = useLanguage();

  return (
    <div className={styles.emptyArchiveState}>
      <div className={styles.emptyIconWrap}>💬</div>
      <p className={styles.emptyTitle}>
        {lang === "ko" ? "아직 리뷰 기록이 없습니다" : "No Review History"}
      </p>
      <p className={styles.emptySub}>
        {lang === "ko"
          ? "관측자의 리뷰가 작성되면 이곳에 기록됩니다."
          : "observer reviews will appear here once they are created."}
      </p>
    </div>
  );
});

ReaderCommentsEmpty.displayName = "ReaderCommentsEmpty";

const AIReviewHeader = React.memo(
  ({ AiReviewList }: { AiReviewList: AiReviewItem[] }) => {
    const { lang } = useLanguage();
    const td = FOCUS_SECTION_DICTIONARY[lang];

    return (
      <div className={styles.archiveBlockHeader}>
        <div>
          <span className={styles.aiBadge}>{td.aiReview.badge}</span>
          <div className={styles.flexWrap}>
            <h3>{td.aiReview.title}</h3>
            <span className={styles.historyCount}>{AiReviewList.length}</span>
          </div>
        </div>
      </div>
    );
  },
);

AIReviewHeader.displayName = "AIReviewHeader";

const ReviewPanelLoading = React.memo(() => {
  return (
    <div className={styles.aiReviewList}>
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
    </div>
  );
});

ReviewPanelLoading.displayName = "ReviewPanelLoading";

const AIReviewPanelEmpty = React.memo(() => {
  const { lang } = useLanguage();

  return (
    <div className={styles.emptyArchiveState}>
      <div className={styles.emptyIconWrap}>💬</div>
      <p className={styles.emptyTitle}>
        {lang === "ko" ? "아직 리뷰 기록이 없습니다" : "No Review History"}
      </p>
      <p className={styles.emptySub}>
        {lang === "ko"
          ? "AI 큐레이터의 리뷰가 작성되면 이곳에 기록됩니다."
          : "AI curator reviews will appear here once they are created."}
      </p>
    </div>
  );
});

AIReviewPanelEmpty.displayName = "AIReviewPanelEmpty";

const AIReviewPanelItem = React.memo(({ item }: { item: AiReviewItem }) => {
  const matchedPersona = useMatchedPersona(item.reviewer);

  const personaAvatar =
    matchedPersona?.imageSrc || item.personaImage || "/야독.png";

  const personaName =
    matchedPersona?.name || item.personaName || item.reviewer || "큐레이터";

  return (
    <div className={styles.historyItemCard}>
      <div className={styles.itemHeader}>
        <div className={styles.itemPersona}>
          <AiThumbnail
            src={personaAvatar}
            w={52}
            h={52}
            className={styles.itemAvatar}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <span className={styles.itemName}>{personaName}</span>
            <Created data={item} className={styles.itemDate} />
          </div>
        </div>

        <div className={styles.itemScoreWrap}>
          <KarmaRating rating={item.rating} size={32} />
        </div>
      </div>
      <p className={styles.itemReviewText}>{item.Comment}</p>
    </div>
  );
});

AIReviewPanelItem.displayName = "AIReviewPanelItem";

const AIReviewPanelList = React.memo(
  ({ aiReviewList }: { aiReviewList: AiReviewItem[] }) => {
    return (
      <div className={styles.aiReviewList}>
        {aiReviewList.slice(0, 6).map((item) => (
          <AIReviewPanelItem key={item.id} item={item} />
        ))}
      </div>
    );
  },
);

AIReviewPanelList.displayName = "AIReviewPanelList";

const StickyBar = React.memo(({ data }: { data: Book }) => {
  return (
    <div className={styles.purchaseBar}>
      <div className={styles.purchaseBook}>
        <Thumbnail data={data} w={48} h={68} />
        <div>
          <strong>{data.title}</strong>
        </div>
      </div>
      <Price data={data} className={styles.totalPrice} />
      <div className={styles.actionButton}>
        <LikeButton data={data} className={styles.likeButton} />
        <BuyButton data={data} className={styles.likeButton} />
      </div>
    </div>
  );
});

StickyBar.displayName = "StickyBar";
