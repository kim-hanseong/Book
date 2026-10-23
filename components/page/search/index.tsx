"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { SEARCH_DICTIONARY } from "@/constants/search/search";
import { Book } from "@/types/book";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import KarmaRating from "@/components/common/Rating";
import { Price } from "@/components/common/Product/Price";
import { BuyButton } from "@/components/common/button/BuyBtn";
import { LikeButton } from "@/components/common/button/LikeBtn";
import { DetailBtn } from "@/components/common/button/DetailBtn";
import { AiReviewItem } from "@/types/aireviewitem";
import { useMatchedPersona } from "@/components/hook/useMatchedPersona";
import { AiThumbnail } from "@/components/common/AiReviewer/ReviewerThumbnail";
import { Authors } from "@/components/common/Product/Authors";
import { FocusBtn } from "@/components/common/button/FocusBtn";
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { useRecentSearches } from "@/components/hook/useRecentSearch";


export interface BookWithReviewer extends Book {
  reviewer: AiReviewItem; // string 또는 AiReviewItem[]
  averageRating: number;
}

export default function SearchResultPage({
  data = [],
  title,
}: {
  data: BookWithReviewer[];
  title: string;
}) {
  const { lang } = useLanguage();
  const dict = SEARCH_DICTIONARY[lang];

  const [sortOption, setSortOption] = useState<string>("relevance");
  const [isFocused, setIsFocused] = useState(false);

  const { addSearchTitle } = useRecentSearches();
  const router = useRouter();

  // title 프로필 변경 시 query 동기화
  useEffect(() => {
    if (title) {
      setQuery(title);
    }
  }, [title]);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  // 1. 타이핑이 멈추고 일정 시간(300ms)이 지나면 debouncedQuery를 업데이트합니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 0.3초 대기

    // 사용자가 계속 타이핑하면 기존 타이머를 취소합니다.
    return () => clearTimeout(timer);
  }, [query]);

  // 2. React Query는 debouncedQuery를 바라보게 설정합니다.
  const { data: searchResults = [] } = useQuery({
    queryKey: ["bookSearch", debouncedQuery],
    queryFn: () => KakaoBookSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 1,
    staleTime: 1000 * 60 * 3, // 3분 동안 같은 검색어는 캐시 사용
  });
  const handleSubmits = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!query.trim()) return;
      addSearchTitle(query);
      const encodedQuery = encodeURIComponent(query);

      router.push(`/search/${encodedQuery}`);
    },
    [query, addSearchTitle, router],
  );

  const handleClearQuery = useCallback(() => {
    setQuery("");
  }, []);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 정렬 옵션 적용 (useMemo)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const list = [...data];

    switch (sortOption) {
      case "rating":
        return list.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
        );
      case "low":
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "high":
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "relevance":
      default:
        return list;
    }
  }, [data, sortOption]);

  return (
    <div className={styles.page}>
      <div className={styles.eyebrow}>{dict.eyebrow}</div>

      {/* 검색 입력창 */}
      <div className={styles.sf}>
        <svg viewBox="0 0 24 24">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
        </svg>
        <form onSubmit={handleSubmits} className={styles.formwrap}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder={dict.searchPlaceholder}
            autoComplete="off"
            spellCheck="false"
          />
        </form>
        <button
          type="button"
          className={styles.sfClear}
          onClick={handleClearQuery}
          aria-label={dict.clearAriaLabel}
        >
          ✕
        </button>
      </div>

      {/* 결과 화면 분기 */}
      {sortedData.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 76 76" fill="none">
            <circle
              className={styles.emptyRing}
              cx="38"
              cy="38"
              r="33"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
            <circle
              className={styles.emptyRing}
              cx="38"
              cy="38"
              r="22"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            <circle cx="38" cy="38" r="2" fill="rgba(255,255,255,0.4)" />
          </svg>
          <div className={styles.emptyEb}>{dict.noResultEb}</div>
          <div className={styles.emptyTitle}>
            {dict.noResultTitle(query.trim())}
          </div>
          <div className={styles.emptyDesc} style={{ whiteSpace: "pre-line" }}>
            {dict.noResultDesc}
          </div>
          <div className={styles.related} style={{ justifyContent: "center" }}>
            <span className={styles.lb}>{dict.relatedTermsEmptyLabel}</span>
          </div>
        </div>
      ) : (
        <>
          {isFocused && query && <SearchResultList books={searchResults} />}

          {/* 요약 헤더 */}
          <div className={styles.summary}>
            <div className={styles.summaryText}>
              <q>{query.trim()}</q>
              {lang === "ko" ? (
                <>
                  에 대한 검색 결과 <b>{sortedData.length}건</b>
                </>
              ) : (
                <>
                  {" "}
                  - <b>{sortedData.length}</b> result(s) found
                </>
              )}
            </div>
          </div>

          {/* 툴바 (필터 + 정렬) */}
          <div className={styles.toolbar}>
            <div className={styles.sortContainer}>
              <span className={styles.lb}>{dict.sortLabel}</span>

              {/* 커스텀 셀렉트 버튼 */}
              <div
                role="button"
                className={`${styles.selectTrigger} ${isSortOpen ? styles.active : ""}`}
                onClick={() => setIsSortOpen((prev) => !prev)}
              >
                <span>
                  {
                    dict.sortOptions[
                      sortOption as keyof typeof dict.sortOptions
                    ]
                  }
                </span>
                <svg
                  className={`${styles.selectArrow} ${isSortOpen ? styles.rotate : ""}`}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* 드롭다운 메뉴 리스트 */}
              {isSortOpen && (
                <div
                  role="button"
                  className={styles.dropdownList}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {Object.entries(dict.sortOptions).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.dropdownItem} ${sortOption === key ? styles.selected : ""}`}
                      onClick={() => {
                        setSortOption(key);
                        setIsSortOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 도서 리스트 */}
          {sortedData.map((item, index) => (
            <DetailBtn
              data={item}
              className={styles.rCover}
              key={item.isbn || item.id || index}
            >
              <article className={styles.result}>
                <div className={styles.rCover}>
                  <Thumbnail
                    data={item}
                    w={80}
                    h={100}
                    className={styles.Cover}
                  />
                </div>

                <div className={styles.rBody}>
                  <div className={styles.rRegion}>
                    <Title data={item} className={styles.rTitle} />
                    <Authors data={item} className={styles.rAuthor} />
                  </div>
                  <FocusCuratorList curatorList={item.reviewer} />
                </div>

                <div className={styles.rSide}>
                  <KarmaRating rating={item.averageRating} />
                  <div className={styles.rCount} />
                  <div className={styles.rPrice}>
                    <Price data={item} className={styles.rPrice} />
                  </div>

                  <div className={styles.rActions}>
                    <BuyButton data={item} className={styles.modalIconBtn} />
                    <LikeButton data={item} className={styles.modalIconBtn} />
                  </div>
                </div>
              </article>
            </DetailBtn>
          ))}
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   SUB COMPONENTS (React.memo 적용)
   ========================================================================== */

const FocusCuratorList = React.memo(function FocusCuratorList({
  curatorList,
}: {
  curatorList: AiReviewItem;
}) {
  // 💡 curatorList가 배열이 아닐 경우를 대비한 안전성 방어막 코드
  const safeList: AiReviewItem[] = useMemo(() => {
    if (!Array.isArray(curatorList)) return [];

    return Array.from(
      new Map(curatorList.map((item) => [item.reviewer, item])).values(),
    );
  }, [curatorList]);

  if (safeList.length === 0) return null;

  return (
    <div className={styles.reviewerAvatarStack}>
      {safeList.map((item, index) => (
        <FocusCuratorItem key={`${item.reviewer}-${index}`} persona={item} />
      ))}
    </div>
  );
});

const FocusCuratorItem = React.memo(function FocusCuratorItem({
  persona,
}: {
  persona: AiReviewItem;
}) {
  const matchedPersona = useMatchedPersona(persona.reviewer);

  return (
    <div className={styles.reviewWrap}>
      <AiThumbnail
        src={matchedPersona?.imageSrc}
        w={35}
        h={35}
        className={styles.itemAvatar}
      />
    </div>
  );
});

interface SearchListProps {
  books: Book[];
}

const SearchResultList = React.memo(function SearchResultList({
  books,
}: SearchListProps) {
  const topBooks = useMemo(() => books.slice(0, 3), [books]);

  return (
    <div
      role="button"
      className={styles.searchResults}
      onMouseDown={(e) => e.preventDefault()} // 👈 이 부분을 추가해주세요!
    >
      {topBooks.map((book, idx) => (
        <SearchResultItem key={book.isbn || book.id || idx} book={book} />
      ))}
    </div>
  );
});

interface SearchItemProps {
  book: Book;
}

const SearchResultItem = React.memo(function SearchResultItem({
  book,
}: SearchItemProps) {
  return (
    <FocusBtn data={book} className={styles.searchItem}>
      <Thumbnail data={book} w={34} h={46} className={styles.searchThumb} />
      <div className={styles.info}>
        <Title data={book} className={styles.t} />
      </div>
      {book.price && <span className={styles.searchPrice}>{book.price}</span>}
    </FocusBtn>
  );
});

const SearchEmpty = React.memo(function SearchEmpty({
  notFoundText,
  emptyDescText,
}: {
  query: string;
  notFoundText: string;
  emptyDescText: string;
}) {
  return (
    <div className={styles.searchEmpty}>
      <svg viewBox="0 0 46 46" fill="none" className={styles.emptySvg}>
        <circle
          className={styles.emptyRing}
          cx="23"
          cy="23"
          r="19"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
        <circle
          className={styles.emptyRing}
          cx="23"
          cy="23"
          r="12"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      </svg>
      <div className={styles.emptyTitle}>{notFoundText}</div>
      <div className={styles.emptyDesc}>{emptyDescText}</div>
    </div>
  );
});
