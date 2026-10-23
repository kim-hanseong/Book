// /lib/queries/books.ts
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { Best_Book_DB } from "@/lib/supabase/supabase";
import { BookDataType } from "@/types/il8n";

// 카테고리별 베스트셀러 데이터를 실제로 가져오는 fetcher
export const fetchBestsellerBooks = async (
  category: string,
  sorting: string,
): Promise<BookDataType[]> => {
  // 인위적 지연 (원하면 제거)
  await new Promise((r) => setTimeout(r, 500));

  const result = await Best_Book_DB(category, sorting);
  const titles = (result.data || []).map((item) => item.title);

  const kakaoResults = await Promise.allSettled(
    titles.map((title) => KakaoBookSearch(title)),
  );

  return kakaoResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<BookDataType[]>).value[0])
    .filter(Boolean);
};
