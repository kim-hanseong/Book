export const DETAIL_MODAL_DICTIONARY = {
  ko: {
    noTitle: "제목 없음",
    unknownAuthor: "작가 정보 없음",
    defaultDesc:
      "깊은 몰입을 선사하는 큐레이션 도서입니다. 몽환적인 밤의 독서를 경험해보세요.",
    exploreBtn: "EXPLORE ↗",
    takeBtn: "TAKE PEARL",
    purchaseAlert: "구매 절차로 이동합니다.",
    dbTestBtn: '🧪 DB 저장 테스트 ("gd" / "curator_silent")',
    requestAiReview: "✦ AI 리뷰 요청하기",
    defaultCuratorName: "야독",
    defaultCuratorRole: "밤의 독서가",
    idleHint: (name: string) => `${name}의 감상평이 준비되어 있습니다.`,
    regenerateBtn: "↺ 다시 요청",
    archiveBadge: "PERSPECTIVE ARCHIVE",
    historyTitle: "이전 AI 리뷰 기록",
    filterAll: "전체",
    loadingHistory: "기록을 불러오는 중...",
    emptyHistoryAll: "작성된 AI 리뷰 기록이 없습니다.",
    emptyHistoryFilter: (name: string) =>
      `'${name}' 페르소나의 리뷰 기록이 없습니다.`,
    errorReviewFallback: "리뷰 생성 중 오류가 발생했습니다.",
    testSuccessAlert: "✅ DB 저장이 성공적으로 완료되었습니다!",
    testFailAlert:
      "❌ DB 저장에 실패하였습니다. 개발자 콘솔(F12)을 확인하세요.",
  },
  en: {
    noTitle: "Untitled",
    unknownAuthor: "Unknown Author",
    defaultDesc:
      "A curated book delivering deep immersion. Experience atmospheric night reading.",
    exploreBtn: "EXPLORE ↗",
    takeBtn: "TAKE PEARL",
    purchaseAlert: "Proceeding to checkout.",
    dbTestBtn: '🧪 DB Save Test ("gd" / "curator_silent")',
    requestAiReview: "✦ Request AI Review",
    defaultCuratorName: "Yadok",
    defaultCuratorRole: "Night Reader",
    idleHint: (name: string) => `Review by ${name} is ready.`,
    regenerateBtn: "↺ Regenerate",
    archiveBadge: "PERSPECTIVE ARCHIVE",
    historyTitle: "Previous AI Reviews",
    filterAll: "ALL",
    loadingHistory: "Loading history...",
    emptyHistoryAll: "No AI review history found.",
    emptyHistoryFilter: (name: string) =>
      `No review records found for '${name}'.`,
    errorReviewFallback: "An error occurred while generating the review.",
    testSuccessAlert: "✅ DB save successful!",
    testFailAlert:
      "❌ DB save failed. Please check the developer console (F12).",
  },
} as const;

export type DetailModalDictionary = typeof DETAIL_MODAL_DICTIONARY;
