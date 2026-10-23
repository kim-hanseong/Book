import { Language } from "@/types/il8n";

export interface NavItem {
  href: string;
  label: string;
}

export const DEFAULT_NAV_ITEMS: Record<Language, NavItem[]> = {
  ko: [
    { href: "#library", label: "내 서재" },
    { href: "#explore", label: "탐색" },
    { href: "#stats", label: "독서 통계" },
    { href: "#settings", label: "설정" },
  ],
  en: [
    { href: "#library", label: "My Library" },
    { href: "#explore", label: "Explore" },
    { href: "#stats", label: "Reading Stats" },
    { href: "#settings", label: "Settings" },
  ],
};

export const HEADER_DICTIONARY = {
  ko: {
    mypage: "내 정보창",
    searchAriaLabel: "검색창 열기",
    menuAriaLabel: "메뉴 열기",
    langAriaLabel: "언어 변경",
    cartAriaLabel: "보관함 이동",
  },
  en: {
    mypage: "my info",
    searchAriaLabel: "Open Search",
    menuAriaLabel: "Open Menu",
    langAriaLabel: "Change Language",
    cartAriaLabel: "Go to Cart",
  },
} as const;

export const SEARCH_DICTIONARY = {
  ko: {
    placeholder: "어떤 펄을 찾으시나요?",
    searchResults: "검색 결과",
    popularPearls: "최근 인기 펄",
    recentSearches: "최근 검색어",
    clearAll: "모두 삭제",
    delete: "삭제",
    notFound: (query: string) => `"${query}"에 해당하는 펄을 찾지 못했어요`,
    esc: "ESC",
  },
  en: {
    placeholder: "Which pearl are you looking for?",
    searchResults: "Search Results",
    popularPearls: "Trending Pearls",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",
    delete: "Delete",
    notFound: (query: string) => `No pearls found matching "${query}"`,
    esc: "ESC",
  },
} as const;
