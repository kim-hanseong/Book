export const SUPABASE_TABLES = {
  USERS: "users",
  BOOKS: "books",
  LIKES: "Like",
  COMMENTS: "comments",
  POST: "posts",
  SHOP_DATA: "Shop", // 네 shop.ts에서 쓰는 테이블 이름
  AiRiview: "reviewer",
  Rating: "Rating",
  Addres: "Consumer",
  Order: "Order",
  // ... 필요한 모든 테이블 이름 추가
} as const; // as const를 붙여서 읽기 전용으로 만들면 더 안전해!
