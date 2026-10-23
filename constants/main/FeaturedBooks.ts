import { Book } from "@/types/book";
import { Language } from "@/types/il8n";

// 1. 카테고리 단일 항목 타입 정의
export interface CategoryItem {
  id: string;
  code: string;
  label: string;
}

// 2. 전체 사전 인터페이스 정의
export interface FeaturedBooksDictionary {
  ariaLabelProduct: string;
  altCoverPrefix: string;
  takePearlBtn: string;
  unknownAuthor: string;
  sectionEyebrow: string;
  sectionTitle: string;
  categories: CategoryItem[]; // string[] 대신 CategoryItem[] 사용
}

export const FEATURED_BOOKS_DICTIONARY: Record<
  Language,
  FeaturedBooksDictionary
> = {
  ko: {
    ariaLabelProduct: "상품 항목",
    altCoverPrefix: "책 커버:",
    takePearlBtn: "펄 건져올리기",
    unknownAuthor: "알 수 없는 저자",
    sectionEyebrow: "구역 선택",
    sectionTitle: "어느 지층까지 내려가시겠어요?",
    categories: [
      { id: "all", code: "00", label: "전체" },
      { id: "fiction", code: "SU", label: "소설" },
      { id: "scifi", code: "HI", label: "SF" },
      { id: "essay", code: "DS", label: "에세이" },
      { id: "poetry", code: "SL", label: "시" },
      { id: "history", code: "SI", label: "역사" },
    ],
  },
  en: {
    ariaLabelProduct: "Product Item",
    altCoverPrefix: "Book cover of",
    takePearlBtn: "Retrieve Pearl",
    unknownAuthor: "Unknown Author",
    sectionEyebrow: "Select Zone",
    sectionTitle: "Which layer would you like to descend to?",
    categories: [
      { id: "all", code: "00", label: "All" },
      { id: "fiction", code: "SU", label: "Fiction" },
      { id: "scifi", code: "HI", label: "Sci-Fi" },
      { id: "essay", code: "DS", label: "Essay" },
      { id: "poetry", code: "SL", label: "Poetry" },
      { id: "history", code: "SI", label: "History" },
    ],
  },
};

export interface FeaturedBooksProps {
  data: Book[];
  isLoading?: boolean;
}

export const CATEGORY_DICTIONARY = {
  ko: [
    {
      id: "eBook",
      label: "eBook",
      apiCategory: "best_category_eBook",
    },
    {
      id: "foreign",
      label: "외국도서",
      apiCategory: "best_category_foreign",
    },
    {
      id: "domestic",
      label: "국내도서",
      apiCategory: "best_category_domestic",
    },
  ],
  en: [
    {
      id: "eBook",
      label: "eBook",
      apiCategory: "best_category_eBook",
    },
    {
      id: "foreign",
      label: "Foreign Books",
      apiCategory: "best_category_foreign",
    },
    {
      id: "domestic",
      label: "Domestic Books",
      apiCategory: "best_category_domestic",
    },
  ],
} as const;
