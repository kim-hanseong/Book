import { getBestSellerTitlesFromSupabase } from "./getBestSellerTitleSupabase";
import { fetchBookDetailsByTitles } from "./fetchBookDetailsTitles";
import { Book } from "@/types/book";

interface FetchBestSellerResult {
  books: Book[];
}
type SortType = "추천일순" | "출판일순" | undefined;

export async function fetchBestSeller(
  category: string,
  sort: SortType,
): Promise<Book[]> {
  try {
    const titles = await getBestSellerTitlesFromSupabase(category, sort);

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
