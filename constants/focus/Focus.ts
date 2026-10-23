export const FOCUS_NAV = {
  ko: [
    { id: "detail", label: "상세" },
    { id: "ai-review", label: "AI 리뷰" },
    { id: "book-content", label: "목차 & 책 소개" },
    { id: "author", label: "저자 소개" },
    { id: "archive", label: "아카이브" },
  ],
  en: [
    { id: "detail", label: "Details" },
    { id: "ai-review", label: "AI Review" },
    { id: "book-content", label: "Contents & About" },
    { id: "author", label: "About the Author" },
    { id: "archive", label: "Archive" },
  ],
} as const;

export const FOCUS_SECTION_DICTIONARY = {
  ko: {
    curatorFocus: "이 책을 주목한 AI 큐레이터",

    bookSpecs: {
      eyebrow: "BOOK SPECS",
      title: "상세 도서 정보",
    },

    bookContent: {
      eyebrow: "SYNOPSIS & CONTENTS",
      title: "책 소개 & 목차",
    },

    archive: {
      eyebrow: "ARCHIVE",
      title: "리뷰 아카이브",
      description:
        "AI 큐레이터의 분석과 실제 독자들의 반응을 분리해서 확인할 수 있습니다.",
    },

    aiReview: {
      badge: "AI ARCHIVE",
      title: "AI 큐레이터 리뷰",
    },

    readerComments: {
      badge: "READER COMMENTS",
      title: "독자 댓글",
      reviewButton: "리뷰하기",
    },
  },

  en: {
    curatorFocus: "AI Curators Who Noticed This Book",

    bookSpecs: {
      eyebrow: "BOOK SPECS",
      title: "Book Details",
    },

    bookContent: {
      eyebrow: "SYNOPSIS & CONTENTS",
      title: "Synopsis & Contents",
    },

    archive: {
      eyebrow: "ARCHIVE",
      title: "Review Archive",
      description:
        "Explore AI curator analysis and real reader reactions separately.",
    },

    aiReview: {
      badge: "AI ARCHIVE",
      title: "AI Curator Reviews",
    },

    readerComments: {
      badge: "READER COMMENTS",
      title: "Reader Comments",
      reviewButton: "Write a Review",
    },
  },
} as const;
