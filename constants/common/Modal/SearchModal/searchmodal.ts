// 예시 구조
export const SEARCH_DICTIONARY = {
  ko: {
    placeholder: "검색어를 입력하세요",
    esc: "ESC",
    recentSearches: "최근검색어",
    clearAll: "모두삭제",
    searchResults: "검색 결과",
    popularPearls: "인기 검색어",
    close: "닫기",
    delete: "삭제",
    emptyDesc: "제목, 저자, 구역으로 검색해보세요",
    notFound: (query: string) => `'${query}'에 대한 검색 결과가 없습니다.`,
  },
  en: {
    placeholder: "Enter search keyword",
    esc: "ESC",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",
    searchResults: "Search Results",
    popularPearls: "Popular Searches",
    close: "Close",
    delete: "Delete",
    emptyDesc: "Search by title, author, or category",
    notFound: (query: string) => `No results found for '${query}'.`,
  },
};
