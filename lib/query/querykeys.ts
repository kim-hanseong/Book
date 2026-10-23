// as const: TypeScript한테 이 객체는 절대 바뀌지 않는다고 알려줘서,
// 타입 추론을 더 정확하게 만들어주는 마법의 주문이야. 꼭 붙여!

export const queryKeys = {
  // 모든 키의 최상위 루트
  all: ["all"] as const,
  // --- 도서(Books) 관련 키 ---
  books: {
    all: () => [...queryKeys.all, "books"] as const,
    // 베스트셀러 목록 (카테고리별)
    bestsellers: (category: string, sorting: string) =>
      [...queryKeys.books.all(), "bestsellers", category, sorting] as const,
    // 특정 책 상세 정보 (ISBN)
    detail: (isbn: string) =>
      [...queryKeys.books.all(), "detail", isbn] as const,
  },

  // --- 좋아요(Likes) 관련 키 ---
  likes: {
    all: () => [...queryKeys.all, "likes"] as const,
    // 현재 유저의 전체 좋아요 목록
    list: () => [...queryKeys.likes.all(), "list"] as const,
  },
  shop: {
    all: () => [...queryKeys.all, "shops"] as const,
    list: () => [...queryKeys.shop.all(), "shoplist"] as const,
  },

  // --- 댓글(Comments) 관련 키 ---
  comments: {
    all: () => [...queryKeys.all, "comments"] as const,
    // 특정 책의 댓글 목록 (ISBN)
    list: (isbn: string) =>
      [...queryKeys.comments.all(), "list", isbn] as const,
  },

  // --- 유저(User) 관련 키 ---
  user: {
    all: () => [...queryKeys.all, "user"] as const,
    // 현재 로그인한 유저 정보
    profile: () => [...queryKeys.user.all(), "profile"] as const,
  },

  // --- 장바구니(Cart) 관련 키 ---
  cart: {
    all: () => [...queryKeys.all, "cart"] as const,
    // 현재 유저의 장바구니 목록
    list: () => [...queryKeys.cart.all(), "list"] as const,
  },
  address: {
    all: () => [...queryKeys.all, "address"] as const,
    // 현재 유저의 장바구니 목록
    list: () => [...queryKeys.cart.all(), "addresss"] as const,
  },
};
