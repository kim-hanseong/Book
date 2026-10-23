// @/constants/main/AiReview.ts
import { Language } from "@/types/il8n";

export interface AiReviewSectionDictionary {
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export const AI_REVIEW_SECTION_DICTIONARY: Record<
  Language,
  AiReviewSectionDictionary
> = {
  ko: {
    badge: "AI CURATION",
    title: "당신을 위한 AI의 책 리뷰",
    description:
      "당신의 성향을 선택하고 맞춤형 큐레이션 한 줄 평을 확인해보세요.",
    imageSrc: "/mainpage.png", // 언어별 이미지가 다르면 "/mainpage_ko.png"
    imageAlt: "책 위의 두 크리처",
  },
  en: {
    badge: "AI CURATION",
    title: "AI Book Review for You",
    description:
      "Select your personality type and check out personalized curations.",
    imageSrc: "/mainpage_en.png", // 영문 이미지 파일 지정 (동일하면 경로 통일)
    imageAlt: "Two creatures on a book",
  },
};
