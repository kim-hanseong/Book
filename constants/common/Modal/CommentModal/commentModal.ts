export const REVIEW_MODAL_DICTIONARY = {
  ko: {
    title: "리뷰 작성",
    ratingQuestion: "이 작품을 어떻게 느끼셨나요",
    ratingHint: "링을 눌러 평가하세요",

    ratingCaptions: [
      "점수를 선택해주세요",
      "별로였어요",
      "그저 그랬어요",
      "괜찮았어요",
      "좋았어요",
      "최고예요",
    ],

    reviewLabel: "감상평",
    reviewPlaceholder: "이 책을 읽으며 느낀 것들을 자유롭게 남겨주세요",

    publicNote:
      "독자 리뷰는 AI 리뷰와 별도로 표시되며, 실명이 아닌 닉네임으로 공개됩니다",

    submitButton: "리뷰 등록하기",
    submittedButton: "등록됨 ✓",
  },

  en: {
    title: "Write a Review",
    ratingQuestion: "How did you feel about this book?",
    ratingHint: "Tap the ring to rate",

    ratingCaptions: [
      "Please select a rating",
      "Not for me",
      "It was okay",
      "Pretty good",
      "I liked it",
      "Absolutely loved it",
    ],

    reviewLabel: "Review",
    reviewPlaceholder:
      "Feel free to share what you thought and felt while reading this book.",

    publicNote:
      "Reader reviews are displayed separately from AI reviews and will be published using your nickname instead of your real name.",

    submitButton: "Submit Review",
    submittedButton: "Submitted ✓",
  },
} as const;

export type ReviewModalDictionary = typeof REVIEW_MODAL_DICTIONARY;
