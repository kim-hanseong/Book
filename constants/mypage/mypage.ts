export const MY_ARCHIVE_DICTIONARY = {
  ko: {
    topEyebrow: "— 당신의 기록 —",
    pageTitle: "MY ARCHIVE",

    // 배송 관련
    deliveryEmpty: "주문 내역이 없습니다.",
    deliveryAddress: "배송지:",
    deliveryPhone: "연락처:",
    orderDate: "주문일:",
    deliverySteps: ["주문완료", "준비중", "배송중", "배송완료"],

    // 최근 구매한 책
    recentPurchasesTitle: "최근 구매한 책",

    // 좋아요한 책
    likedBooksTitle: "좋아요한 책",

    // AI 리뷰어
    mostUsedReviewerTitle: "자주 찾는 AI 리뷰어",
    ratingDistribution: "평점 분포",

    // 최근 관측/댓글
    recentCommentTitle: "최근 관측한 책",
    commentEmpty: "작성한 댓글이 없습니다.",

    // Empty States
    emptyOrder: {
      eb: "— 조용한 길 —",
      title: "진행 중인 배송이 없어요",
      desc: "주문한 펄이 생기면, 이 길을 따라 도착하는 모습을 볼 수 있어요.",
      cta: "서가 둘러보기",
    },
    emptyPurchase: {
      eb: "— 아직 비어 있어요 —",
      title: "구매한 책이 없어요",
      desc: "책을 구매해보세요,\n이곳에 차곡차곡 쌓여요.",
      cta: "첫 구매하기",
    },
    emptyLiked: {
      eb: "— 마음을 건넨 책 —",
      title: "좋아요한 책이 없어요",
      desc: "마음에 드는 책을 발견하면,\n좋아요를 눌러 이곳에 모아보세요.",
      cta: "책 찾아보기",
    },
    emptyReviewer: {
      eb: "— 아직 비어 있어요 —",
      title: "자주 찾는 리뷰어가 없어요",
      desc: "AI 리뷰어와 대화를 나누면,\n이곳에 자주 찾는 리뷰어가 기록돼요.",
      cta: "리뷰어 만나러 가기",
    },
    emptyComment: {
      eb: "— 아직 비어 있어요 —",
      title: "남긴 감상이 아직 없어요",
      desc: "읽은 책에 첫 감상을 남기면,\n이곳에 차곡차곡 쌓여요.",
      cta: "첫 감상 남기기",
    },
  },
  en: {
    topEyebrow: "— YOUR RECORDS —",
    pageTitle: "MY ARCHIVE",

    // Delivery
    deliveryEmpty: "No order history found.",
    deliveryAddress: "Address:",
    deliveryPhone: "Contact:",
    orderDate: "Order Date:",
    deliverySteps: ["Order Placed", "Preparing", "Shipping", "Delivered"],

    // Recent Purchases
    recentPurchasesTitle: "Recent Purchases",

    // Liked Books
    likedBooksTitle: "Liked Books",

    // AI Reviewer
    mostUsedReviewerTitle: "Most Used AI Reviewers",
    ratingDistribution: "Rating Distribution",

    // Recent Comments
    recentCommentTitle: "Recently Observed Books",
    commentEmpty: "No comments written yet.",

    // Empty States
    emptyOrder: {
      eb: "— QUIET PATH —",
      title: "No deliveries in progress",
      desc: "When you place an order, you can track its arrival along this path.",
      cta: "Browse Bookshelf",
    },
    emptyPurchase: {
      eb: "— STILL EMPTY —",
      title: "No purchased books yet",
      desc: "Purchase books and they will stack up neatly here.",
      cta: "Make First Purchase",
    },
    emptyLiked: {
      eb: "— FAVORITES —",
      title: "No liked books yet",
      desc: "Discover books you love and like them to keep them here.",
      cta: "Explore Books",
    },
    emptyReviewer: {
      eb: "— STILL EMPTY —",
      title: "No favorite reviewers yet",
      desc: "Chat with AI reviewers to log your most visited reviewers here.",
      cta: "Meet Reviewers",
    },
    emptyComment: {
      eb: "— STILL EMPTY —",
      title: "No thoughts left yet",
      desc: "Leave your first impression on a book and it will be archived here.",
      cta: "Leave First Review",
    },
  },
} as const;
