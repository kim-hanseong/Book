"use client";

import React, { useMemo } from "react";
import styles from "./index.module.css";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { usePersona } from "@/components/Context/usePersonaContext";
import KarmaRating from "@/components/common/Rating";
import { Book } from "@/types/book";
import { AiReviewItem } from "@/types/aireviewitem";
import { useMatchedPersona } from "@/components/hook/useMatchedPersona";
import { AiThumbnail } from "@/components/common/AiReviewer/ReviewerThumbnail";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import { MY_ARCHIVE_DICTIONARY } from "@/constants/mypage/mypage";
import { useModalStack } from "@/components/hook/useContextModal";
import DetailModal from "@/components/common/Modal/DetailModal";

export interface OrderItem {
  id: string | number;
  title: string;
  Address?: string;
  AddressInfo?: string;
  Phone?: string;
  created_at?: string;
  date?: string;
  stepIndex?: number;
  books?: { title: string; category: string }[];
}

export interface CommentItem {
  id?: string | number;
  isbn?: string;
  title: string;
  category?: string;
  rating: number;
  date: string;
  text?: string;
  count?: number;
  reviewer?: string;
  name?: string;
  Comment?: string;
  created_at?: string;
}

export default function MyArchivePage({
  mostReviewer,
  order,
  comment,
  like,
  orderend,
}: {
  orderend: Book[];
  mostReviewer: AiReviewItem[];
  order: OrderItem[];
  comment: CommentItem[];
  like: Book[];
}) {
  const { lang } = useLanguage();
  const currentLang = (lang === "en" ? "en" : "ko") as "ko" | "en";
  const dict = MY_ARCHIVE_DICTIONARY[currentLang];

  const { openModal } = useModalStack();

  const handleOpenDetailModal = (bookData: Book) => {
    openModal("detail-modal", <DetailModal data={bookData} />);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.grain} />
      <div className={styles.top}>
        <div className={styles.eyebrow}>{dict.topEyebrow}</div>
        <div className={styles.pageTitle}>{dict.pageTitle}</div>
      </div>

      <div className={styles.layout}>
        <main className={styles.main}>
          {/* 1. 배송 상태 섹션 */}
          {order && order.length > 0 ? (
            <DeliveryList orders={order} dict={dict} />
          ) : (
            <EmptyOrderSection dict={dict} />
          )}

          {/* 3. 자주 찾는 AI 리뷰어 섹션 */}
          {mostReviewer && mostReviewer.length > 0 ? (
            <MostUsedReviewerSection reviewers={mostReviewer} dict={dict} />
          ) : (
            <EmptyReviewerSection dict={dict} />
          )}
          {like && like.length > 0 ? (
            <LikedBooksSection books={like} dict={dict} />
          ) : (
            <EmptyLikedSection dict={dict} />
          )}

          {/* 2. 최근 구매한 책 섹션 */}
          {orderend && orderend.length > 0 ? (
            <RecentPurchasesSection reviews={orderend} dict={dict} />
          ) : (
            <EmptyPurchaseSection dict={dict} />
          )}

          {/* 4. 최근 관측한 책/댓글 섹션 */}
          {comment && comment.length > 0 ? (
            <RecentCommentSection comments={comment} dict={dict} />
          ) : (
            <EmptyCommentSection dict={dict} />
          )}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// Delivery Components
// ==========================================
const DeliveryList = React.memo(function DeliveryList({
  orders,
  dict,
}: {
  orders: OrderItem[];
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const groupedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const map = new Map<
      string,
      { representativeOrder: OrderItem; items: OrderItem[] }
    >();

    orders.forEach((order) => {
      const dateStr = order.created_at
        ? order.created_at.split("T")[0]
        : order.date || "";
      const address = (order.Address || "").trim();
      const addressInfo = (order.AddressInfo || "").trim();

      const groupKey = `${dateStr}_${address}_${addressInfo}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          representativeOrder: { ...order },
          items: [],
        });
      }

      const group = map.get(groupKey)!;
      group.items.push(order);
    });

    return Array.from(map.values());
  }, [orders]);

  if (groupedOrders.length === 0) {
    return <div className={styles.empty}>{dict.deliveryEmpty}</div>;
  }

  return (
    <div className={styles.listContainer}>
      {groupedOrders.map(({ representativeOrder, items }, index) => {
        const extraCount = items.length - 1;
        const displayTitle =
          extraCount > 0
            ? `${representativeOrder.title} +${extraCount}`
            : representativeOrder.title;

        return (
          <DeliveryCard
            key={representativeOrder.id || index}
            order={{ ...representativeOrder, title: displayTitle }}
            dict={dict}
          />
        );
      })}
    </div>
  );
});

const DeliveryCard = React.memo(function DeliveryCard({
  order,
  dict,
}: {
  order: OrderItem;
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  return (
    <div className={styles.orderCard}>
      <div className={styles.infoSection}>
        {order.Address && (
          <div className={styles.infoRow}>
            <span className={styles.label}>{dict.deliveryAddress}</span>
            <span className={styles.value}>
              {order.Address}, {order.AddressInfo}
            </span>
          </div>
        )}
        {order.Phone && (
          <div className={styles.infoRow}>
            <span className={styles.label}>{dict.deliveryPhone}</span>
            <span className={styles.value}>{order.Phone}</span>
          </div>
        )}
      </div>
      <DeliveryStatusTracker order={order} dict={dict} />
    </div>
  );
});

const DeliveryStatusTracker = React.memo(function DeliveryStatusTracker({
  order,
  dict,
}: {
  order: OrderItem;
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const steps = dict.deliverySteps;

  const currentStepIndex = useMemo(() => {
    if (!order?.created_at) return order.stepIndex ?? 0;

    const createdDate = new Date(order.created_at);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.min(Math.max(diffDays, 0), steps.length - 1);
  }, [order?.created_at, order?.stepIndex, steps.length]);

  const orderDateFormatted = useMemo(() => {
    if (!order?.created_at) return order?.date || "";
    return new Date(order.created_at).toLocaleDateString();
  }, [order?.created_at, order?.date]);

  return (
    <div className={styles.container}>
      <div className={styles.orderHeader}>
        <span className={styles.title}>{order.title}</span>
        {orderDateFormatted && (
          <span className={styles.date}>
            {dict.orderDate} {orderDateFormatted}
          </span>
        )}
      </div>

      <div className={styles.stepper}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step}
              className={`${styles.stepItem} ${
                isCompleted ? styles.completed : ""
              } ${isCurrent ? styles.current : ""}`}
            >
              <div className={styles.stepCircle}>
                {isCompleted ? "✓" : index + 1}
              </div>
              <span className={styles.stepLabel}>{step}</span>

              {index < steps.length - 1 && (
                <div
                  className={`${styles.stepLine} ${
                    index < currentStepIndex ? styles.lineCompleted : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ==========================================
// Recent Purchases Section
// ==========================================
const RecentPurchasesSection = React.memo(function RecentPurchasesSection({
  reviews,
  dict,
}: {
  reviews: Book[];
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  return (
    <div className={styles.commentList}>
      <div className={styles.secHead}>
        <div className={styles.label}>
          <div className={styles.eb}>Recent</div>
          <div className={styles.tt}>{dict.recentPurchasesTitle}</div>
        </div>
        <span className={styles.rule} />
      </div>
      {reviews.map((item, index) => (
        <article key={index} className={styles.textReviewPlate}>
          <div className={styles.plateHeader}>
            <Thumbnail data={item} w={60} h={80} className="" />
            <Title className={styles.bookTitle} data={item} />
          </div>
          <div className={styles.plateFooter} />
        </article>
      ))}
    </div>
  );
});

// ==========================================
// Most Used Reviewer Section
// ==========================================
const MostUsedReviewerSection = React.memo(function MostUsedReviewerSection({
  reviewers,
  dict,
}: {
  reviewers: AiReviewItem[];
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const topReviewers = useMemo(() => reviewers.slice(0, 3), [reviewers]);

  return (
    <section className={styles.mostUsedSection}>
      <div className={styles.secHead}>
        <div className={styles.label}>
          <div className={styles.eb}>Most Used</div>
          <div className={styles.tt}>{dict.mostUsedReviewerTitle}</div>
        </div>
        <span className={styles.rule} />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.leftInfoArea}>
          <UserAiState list={topReviewers} />
        </div>

        <div className={styles.verticalGraphWrapper}>
          <div className={styles.graphTitle}>{dict.ratingDistribution}</div>
          <div className={styles.graphContainer}>
            {topReviewers.map((item, idx) => {
              const rating = Number(item.rating) || 0;
              const heightPercent = Math.min(
                Math.max((rating / 5) * 100, 10),
                100,
              );
              const isTop = idx === 0;

              return (
                <div key={item.reviewer || idx} className={styles.graphColumn}>
                  <span className={styles.barValue}>{rating}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${isTop ? styles.topBarFill : ""}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={styles.barLabel}>
                    {item.name || item.reviewer?.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

const UserAiState = React.memo(function UserAiState({
  list,
}: {
  list: AiReviewItem[];
}) {
  return (
    <div className={styles.reviewerAvatarStack}>
      {list.map((item, idx) => (
        <UserAiStateItem
          key={item.reviewer || item.id}
          item={item}
          index={idx}
        />
      ))}
    </div>
  );
});

const UserAiStateItem = React.memo(function UserAiStateItem({
  item,
  index,
}: {
  item: AiReviewItem;
  index: number;
}) {
  const matchedPersona = useMatchedPersona(item.reviewer);
  const personaAvatar = matchedPersona?.imageSrc || "/야독.png";
  const sizes = [100, 70, 65];
  const size = sizes[index] ?? 24;

  return (
    <div
      className={styles.reviewerAvatar}
      style={{ width: size, height: size }}
    >
      <AiThumbnail
        src={personaAvatar}
        w={size}
        h={size}
        className={styles.reviewerThumbnail}
      />
    </div>
  );
});

interface LikedBooksSectionProps {
  books: Book[];
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}

const LikedBooksSection = React.memo(function LikedBooksSection({
  books,
  dict,
}: LikedBooksSectionProps) {
  return (
    <div className={styles.commentList}>
      <div className={styles.secHead}>
        <div className={styles.label}>
          <div className={styles.eb}>Favorites</div>
          <div className={styles.tt}>{dict.likedBooksTitle}</div>
        </div>
        <span className={styles.rule} />
      </div>
      {books.map((item, index) => (
        <article key={item.isbn || index} className={styles.textReviewPlate}>
          <div className={styles.plateHeader}>
            <Thumbnail data={item} w={60} h={80} className="" />
            <div className={styles.bookInfoGroup}>
              <Title className={styles.bookTitle} data={item} />
            </div>
            <div className={styles.likeIconWrap}></div>
          </div>
          <div className={styles.plateFooter} />
        </article>
      ))}
    </div>
  );
});

// ==========================================
// Empty Liked State Component
// ==========================================
function EmptyLikedSection({
  dict,
}: {
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const t = dict.emptyLiked;

  return (
    <section className={styles.section}>
      <div className={styles.emptyPlates} aria-hidden="true">
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
      </div>

      <div className={styles.emptyCenter}>
        <div className={styles.eEb}>{t.eb}</div>
        <div className={styles.eTitle}>{t.title}</div>
        <div className={styles.eDesc} style={{ whiteSpace: "pre-line" }}>
          {t.desc}
        </div>
        <a href="/search" className={styles.cta}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}
// ==========================================
// Recent Comment Section
// ==========================================
const RecentCommentSection = React.memo(function RecentCommentSection({
  comments = [],
  dict,
}: {
  comments: CommentItem[];
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  if (!comments || comments.length === 0) {
    return <div className={styles.empty}>{dict.commentEmpty}</div>;
  }

  return (
    <div className={styles.commentList}>
      <div className={styles.secHead}>
        <div className={styles.label}>
          <div className={styles.eb}>Recent</div>
          <div className={styles.tt}>{dict.recentCommentTitle}</div>
        </div>
        <span className={styles.rule} />
      </div>
      {comments.map((item, index) => {
        const displayRating = Number(item.rating) || 0;
        const displayDate =
          item.date || (item.created_at ? item.created_at.split("T")[0] : "");
        const itemKey = item.id || index;

        return (
          <article key={itemKey} className={styles.textReviewPlate}>
            <div className={styles.plateHeader}>
              <Title className={styles.bookTitle} data={item} />
              <KarmaRating rating={displayRating} size={28} />
            </div>

            <p className={styles.quoteText}>{item.Comment}</p>

            <div className={styles.plateFooter}>
              {displayDate && (
                <time className={styles.date}>{displayDate}</time>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
});

// ==========================================
// Empty State Components
// ==========================================
function EmptyOrderSection({
  dict,
}: {
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const t = dict.emptyOrder;
  const steps = dict.deliverySteps;

  return (
    <section className={styles.emptySection}>
      <div className={styles.secHead}>
        <div className={styles.label}>
          <div className={styles.eb}>Delivery</div>
          <div className={styles.tt}>{steps[2]}</div>
        </div>
        <span className={styles.rule} />
      </div>

      <div className={styles.ghostRow}>
        <div className={styles.ghostPearls}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.ghostText}>
          <div className={styles.eEb}>{t.eb}</div>
          <div className={styles.eTitle}>{t.title}</div>
          <div className={styles.eDesc}>{t.desc}</div>
        </div>
        <a href="/search" className={`${styles.cta} ${styles.waterFx}`}>
          {t.cta}
        </a>
      </div>

      <div className={styles.path} aria-hidden="true">
        <div className={styles.pathTrack} />
        {steps.map((step) => (
          <div key={step} className={styles.node}>
            <div className={styles.nodeDot} />
            <div className={styles.nodeName}>{step}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyPurchaseSection({
  dict,
}: {
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const t = dict.emptyPurchase;

  return (
    <section className={styles.section}>
      <div className={styles.emptyPlates} aria-hidden="true">
        <div className={styles.ep}></div>
        <div className={styles.ep}></div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
      </div>

      <div className={styles.emptyCenter}>
        <div className={styles.eEb}>{t.eb}</div>
        <div className={styles.eTitle}>{t.title}</div>
        <div className={styles.eDesc} style={{ whiteSpace: "pre-line" }}>
          {t.desc}
        </div>
        <a href="/search" className={styles.cta}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}

function EmptyReviewerSection({
  dict,
}: {
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const t = dict.emptyReviewer;

  return (
    <section className={styles.section}>
      <div className={styles.emptyPlates} aria-hidden="true">
        <div className={styles.ep}>
          <span className={styles.epOrb}></span>
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
      </div>

      <div className={styles.emptyCenter}>
        <div className={styles.eEb}>{t.eb}</div>
        <div className={styles.eTitle}>{t.title}</div>
        <div className={styles.eDesc} style={{ whiteSpace: "pre-line" }}>
          {t.desc}
        </div>
        <a href="/search" className={styles.cta}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}

function EmptyCommentSection({
  dict,
}: {
  dict: (typeof MY_ARCHIVE_DICTIONARY)["ko" | "en"];
}) {
  const t = dict.emptyComment;

  return (
    <section className={styles.section}>
      <div className={styles.emptyPlates} aria-hidden="true">
        <div className={styles.ep}>
          <span className={styles.epOrb}></span>
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
        <div className={styles.ep}>
          <span className={styles.epOrb} />
        </div>
      </div>

      <div className={styles.emptyCenter}>
        <div className={styles.eEb}>{t.eb}</div>
        <div className={styles.eTitle}>{t.title}</div>
        <div className={styles.eDesc} style={{ whiteSpace: "pre-line" }}>
          {t.desc}
        </div>
        <a href="/search" className={styles.cta}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}
