import { Best_Book_DB } from "../supabase/supabase";

type SortType = "추천일순" | "출판일순" | undefined;

export async function getBestSellerTitlesFromSupabase(
  category: string,
  sort: SortType,
) {
  const result = await Best_Book_DB(category, sort);

  if (!result?.data) {
    return [];
  }

  return result.data.map((item: { title: string }) => item.title);
}
