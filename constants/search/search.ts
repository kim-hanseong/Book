export interface SearchDictionary {
  eyebrow: string;
  searchPlaceholder: string;
  clearAriaLabel: string;
  noResultEb: string;
  noResultTitle: (q: string) => string;
  noResultDesc: string;
  relatedTermsLabel: string;
  relatedTermsEmptyLabel: string;
  summaryText: (q: string, count: number) => { query: string; count: number };
  allRegionLabel: string;
  sortLabel: string;
  sortOptions: {
    relevance: string;
    rating: string;
    low: string;
    high: string;
  };
  regionNames: Record<string, [string, string]>; // [코드, 명칭]
  ratingCountSuffix: string;
  wishAriaLabel: string;
  cartAriaLabel: string;
  prevPageAriaLabel: string;
  nextPageAriaLabel: string;
}

export const SEARCH_DICTIONARY: Record<"ko" | "en", SearchDictionary> = {
  ko: {
    eyebrow: "— Search Result —",
    searchPlaceholder: "어떤 펄을 찾으시나요?",
    clearAriaLabel: "지우기",
    noResultEb: "— No Result —",
    noResultTitle: (q) =>
      q ? `"${q}"에 해당하는 펄을 찾지 못했어요` : "검색어를 입력해주세요",
    noResultDesc:
      "철자를 확인하거나, 더 짧은 검색어로 다시 찾아보세요.\n제목 · 저자 · 구역(소설, SF, 에세이…)으로 검색할 수 있어요.",
    relatedTermsLabel: "연관 검색어",
    relatedTermsEmptyLabel: "이런 검색어는 어때요",
    summaryText: (q, count) => ({ query: q, count }),
    allRegionLabel: "전체",
    sortLabel: "정렬",
    sortOptions: {
      relevance: "정확도순",
      rating: "평점 높은순",
      low: "가격 낮은순",
      high: "가격 높은순",
    },
    regionNames: {
      fiction: ["SU", "소설"],
      scifi: ["HI", "SF"],
      essay: ["DS", "에세이"],
      poetry: ["SL", "시"],
      history: ["SI", "역사"],
    },
    ratingCountSuffix: "명 평가",
    wishAriaLabel: "찜하기",
    cartAriaLabel: "담기",
    prevPageAriaLabel: "이전",
    nextPageAriaLabel: "다음",
  },
  en: {
    eyebrow: "— Search Result —",
    searchPlaceholder: "Which pearl are you looking for?",
    clearAriaLabel: "Clear",
    noResultEb: "— No Result —",
    noResultTitle: (q) =>
      q ? `No pearls found matching "${q}"` : "Please enter a search query",
    noResultDesc:
      "Check the spelling or try searching with shorter keywords.\nYou can search by Title, Author, or Category (Fiction, Sci-Fi, Essay...).",
    relatedTermsLabel: "Related Searches",
    relatedTermsEmptyLabel: "Try these search terms",
    summaryText: (q, count) => ({ query: q, count }),
    allRegionLabel: "ALL",
    sortLabel: "Sort",
    sortOptions: {
      relevance: "Relevance",
      rating: "Highest Rated",
      low: "Price: Low to High",
      high: "Price: High to Low",
    },
    regionNames: {
      fiction: ["SU", "Fiction"],
      scifi: ["HI", "Sci-Fi"],
      essay: ["DS", "Essay"],
      poetry: ["SL", "Poetry"],
      history: ["SI", "History"],
    },
    ratingCountSuffix: "reviews",
    wishAriaLabel: "Wishlist",
    cartAriaLabel: "Add to Cart",
    prevPageAriaLabel: "Previous",
    nextPageAriaLabel: "Next",
  },
};
