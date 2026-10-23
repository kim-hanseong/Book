"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Button from "../../../button/EffectBtn";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { SEARCH_DICTIONARY } from "@/constants/navigation";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { Book } from "@/types/book";
import { useRecentSearches } from "@/components/hook/useRecentSearch";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { FocusBtn } from "@/components/common/button/FocusBtn";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";

export default function SearchModal() {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const dictionary = SEARCH_DICTIONARY[lang];
  const router = useRouter();

  const { recentTitles, addSearchTitle, removeSearchTitle, clearAll } =
    useRecentSearches();

  const isClosingRef = useRef(false);

  const handleSafeClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    closeModal();
  }, [closeModal]);

  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // React Query 최적화 (staleTime 추가)
  const { data: searchResults = [] } = useQuery({
    queryKey: ["bookSearch", debouncedQuery],
    queryFn: () => KakaoBookSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 60 * 3, // 3분 캐시
  });

  const { data: recentlist = [] } = useQuery({
    queryKey: ["recent"],
    queryFn: fetchBuyList,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  const handleSelectBook = useCallback(
    (book: Book) => {
      addSearchTitle(book.title);
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      closeModal();
    },
    [addSearchTitle, closeModal],
  );

  const handleSelectRecentTitle = useCallback(
    (title: string) => {
      addSearchTitle(title);
      router.push(`/search/${title}`);
      closeModal();
    },
    [addSearchTitle, router, closeModal],
  );

  const handleSubmits = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!inputValue.trim()) return;

      addSearchTitle(inputValue);
      const encodedQuery = encodeURIComponent(inputValue);

      router.push(`/search/${encodedQuery}`);

      setTimeout(() => {
        closeModal();
      }, 50);
    },
    [inputValue, addSearchTitle, router, closeModal],
  );

  return (
    <div className={styles.searchOverlay}>
      <div className={styles.searchPanel}>
        <form onSubmit={handleSubmits}>
          <SearchInput
            value={inputValue}
            onChange={setInputValue}
            onClose={handleSafeClose}
            placeholder={dictionary.placeholder}
            escText={dictionary.esc}
          />
        </form>

        <div className={styles.searchBox}>
          {/* 1. 검색어가 없을 때: 최근 검색어 목록 */}
          {!inputValue && (
            <RecentSearchList
              titles={recentTitles}
              recentSearchesText={dictionary.recentSearches}
              clearAllText={dictionary.clearAll}
              deleteAriaLabel={dictionary.delete ?? "삭제"}
              onSelectTitle={handleSelectRecentTitle}
              onRemoveTitle={removeSearchTitle}
              onClearAll={clearAll}
            />
          )}

          {/* 2. 검색 중이고 결과가 있을 때 vs 결과가 없을 때 */}
          {inputValue &&
            (searchResults.length > 0 ? (
              <SearchResultList
                onSave={handleSelectBook}
                books={searchResults}
                title={dictionary.searchResults}
              />
            ) : (
              <div className={styles.searchResults}>
                <SearchEmpty
                  query={inputValue}
                  notFoundText={dictionary.notFound(inputValue)}
                />
              </div>
            ))}

          {/* 키보드 안내 푸터 */}
          <div className={styles.searchFoot}>
            <span>
              <kbd>ESC</kbd>
              {"close"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SUB COMPONENTS (React.memo 최적화 적용)
   ========================================================================== */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  placeholder: string;
  escText: string;
}

const SearchInput = React.memo(function SearchInput({
  value,
  onChange,
  onClose,
  placeholder,
  escText,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={classNames(styles.searchField, {
        [styles.focused]: isFocused,
      })}
    >
      <svg viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <line x1="15.5" y1="15.5" x2="21" y2="21" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={styles.searchInput}
      />
      <button type="submit" style={{ display: "none" }} />
      {escText && (
        <button type="button" className={styles.searchEsc} onClick={onClose}>
          {escText}
        </button>
      )}
    </div>
  );
});

interface RecentSearchListProps {
  titles: string[];
  recentSearchesText: string;
  clearAllText: string;
  deleteAriaLabel: string;
  onSelectTitle: (title: string) => void;
  onRemoveTitle: (title: string) => void;
  onClearAll: () => void;
}

const RecentSearchList = React.memo(function RecentSearchList({
  titles,
  recentSearchesText,
  clearAllText,
  deleteAriaLabel,
  onSelectTitle,
  onRemoveTitle,
  onClearAll,
}: RecentSearchListProps) {
  const topTitles = useMemo(() => titles.slice(0, 3), [titles]);

  return (
    <div className={styles.searchResults}>
      <div className={styles.recentHeader}>
        <span className={styles.clearAllBtn}>{recentSearchesText}</span>
        <Button
          type="button"
          className={styles.clearAllBtn}
          onClick={onClearAll}
        >
          {clearAllText}
        </Button>
      </div>
      {topTitles.map((itemTitle) => (
        <div
          key={itemTitle}
          role="button"
          className={styles.searchItem}
          onClick={() => onSelectTitle(itemTitle)}
        >
          <svg className={styles.searchClock} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
          </svg>
          <div className={styles.info}>
            <div className={styles.t}>{itemTitle}</div>
          </div>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTitle(itemTitle);
            }}
            aria-label={deleteAriaLabel}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
});

interface SearchListProps {
  books: Book[];
  title: string;
  onSave: (item: Book) => void;
}

const SearchResultList = React.memo(function SearchResultList({
  books,
  onSave,
}: SearchListProps) {
  const topBooks = useMemo(() => books.slice(0, 3), [books]);

  return (
    <div className={styles.searchResults}>
      {topBooks.map((book, idx) => (
        <SearchResultItem
          key={book.isbn || book.id || idx}
          book={book}
          onSave={onSave}
        />
      ))}
    </div>
  );
});

interface SearchItemProps {
  book: Book;
  onSave: (item: Book) => void;
}

const SearchResultItem = React.memo(function SearchResultItem({
  book,
  onSave,
}: SearchItemProps) {
  return (
    <FocusBtn
      onClick={() => onSave(book)}
      data={book}
      className={styles.searchItem}
    >
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
}: {
  query: string;
  notFoundText: string;
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
    </div>
  );
});
