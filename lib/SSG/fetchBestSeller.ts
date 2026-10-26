import { getBestSellerTitlesFromSupabase } from "./getBestSellerTitleSupabase";
import { fetchBookDetailsByTitles } from "./fetchBookDetailsTitles";

import { Book } from "@/types/book";

export async function fetchBestSeller(category: string): Promise<Book[]> {
  try {
    const titles = await getBestSellerTitlesFromSupabase(category);

    if (!titles || titles.length === 0) {
      return [];
    }

    const books = await fetchBookDetailsByTitles(titles);

    return books ?? [];
  } catch (error) {
    console.error("Error fetching best seller data:", error);

    return []; // 에러 발생 시 빈 배열 반환
  }
}
