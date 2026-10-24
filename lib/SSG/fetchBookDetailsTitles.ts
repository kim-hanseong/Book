import { KakaoBookSearch } from "../kakao/bookApi";

import { Book } from "@/types/book";

export async function fetchBookDetailsByTitles(
  titles: string[],
): Promise<Book[]> {
  const searchResults = await Promise.allSettled(
    titles.map((title) => KakaoBookSearch(title)),
  );

  return searchResults
    .map((res) => {
      if (res.status === "fulfilled" && res.value?.[0]) {
        return res.value[0];
      }

      return null;
    })
    .filter((book): book is Book => !!book);
}
