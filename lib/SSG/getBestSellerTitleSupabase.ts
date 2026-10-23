import { FetchBestSellerParams } from "@/types/il8n";
import { Best_Book_DB } from "../supabase/supabase";

type SortType = "추천일순" | "출판일순" | undefined;

export async function getBestSellerTitlesFromSupabase(
  category: string,
  sort: SortType,
) {
  const result = await Best_Book_DB(category, sort);
  console.log("Supabase 결과:", result); // 이 로그 추가

  if (!result?.data) {
    console.log("책 데이터가 없습니다.");
    return [];
  }
  console.log(
    "정렬된 결과:",
    result?.data?.map((r) => r.publicationdate),
  );

  return result.data.map((item: { title: string }) => item.title);
}
