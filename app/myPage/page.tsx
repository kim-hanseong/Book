import MyArchivePage from "@/components/page/mypage";
import { ReadLike } from "@/lib/api/likemutate";
import { EndOrder, ReadOrder } from "@/lib/api/orderAction";
import { ReadUserPost } from "@/lib/api/postAction";
import { UserAiReviewerDataBase } from "@/lib/api/userAiState";
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { Book } from "@/types/book";

export default async function Page() {
  const [userPosts, mostReviewer, orderList, endOrder, likeList] =
    await Promise.all([
      ReadUserPost(),
      UserAiReviewerDataBase(),
      ReadOrder(),
      EndOrder(),
      ReadLike(),
    ]);

  // 💡 [최적화 1] 동일한 책 제목으로 API를 중복 호출하는 것을 막기 위한 인메모리 캐시 맵
  const searchCache = new Map<string, any[]>();

  const fetchAndMatchBook = async (item: { title?: string; isbn?: string }) => {
    if (!item?.title) return null;

    try {
      // 캐시에 없으면 API 호출 후 저장
      if (!searchCache.has(item.title)) {
        const searchResults = await KakaoBookSearch(item.title);
        const bookList = searchResults?.documents || searchResults || [];
        searchCache.set(item.title, bookList);
      }

      const bookList = searchCache.get(item.title)!;

      // ISBN 매칭 (없으면 검색 결과 첫 번째 항목 반환)
      const matchedBook = item.isbn
        ? bookList.find((book: any) => book.isbn?.includes(item.isbn))
        : bookList[0];

      return matchedBook || bookList[0] || null;
    } catch (error) {
      console.error(`Book search failed for: ${item.title}`, error);
      return null;
    }
  };

  // 💡 [최적화 2] 공통 함수를 사용하여 병렬 처리 및 null 제거(.filter(Boolean))
  const [enrichedEndOrder, Like] = await Promise.all([
    endOrder && endOrder.length > 0
      ? Promise.all(endOrder.map(fetchAndMatchBook)).then(
          (res) => res.filter(Boolean) as Book[],
        )
      : Promise.resolve([]),

    Array.isArray(likeList) && likeList.length > 0
      ? Promise.all(likeList.map(fetchAndMatchBook)).then(
          (res) => res.filter(Boolean) as Book[],
        )
      : Promise.resolve([]),
  ]);

  return (
    <MyArchivePage
      order={orderList}
      mostReviewer={mostReviewer}
      comment={userPosts}
      orderend={enrichedEndOrder}
      like={Like}
    />
  );
}
