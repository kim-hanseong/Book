import SearchResultPage from "@/components/page/search";
import { ReadRating } from "@/lib/api/ratingAction";
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { fetchReviewer } from "@/lib/supabase/supabase";
import { Book } from "@/types/book";

interface PageProps {
  params: Promise<{
    title: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  // 1. 카카오 API로 도서 검색 결과 가져오기
  const bestSellerData = await KakaoBookSearch(decodedTitle);

  // 2. 모든 도서 각각에 대해 ReadRating을 병렬로 호출하여 평점 데이터 결합하기
  const booksWithRating = await Promise.all(
    bestSellerData.map(async (book: Book) => {
      // 💡 카카오 API의 필드명에 맞게 book.title, book.isbn 등을 지정해주세요.
      // (카카오 ISBN은 '구ISB 신ISBN' 형태로 공백이 섞여있을 수 있어 앞쪽 ISBN만 쓸 수도 있습니다)
      const isbnToUse = book.isbn;

      const ratingData = await ReadRating(book.title, isbnToUse);
      const { reviewer } = await fetchReviewer(book.title, isbnToUse);

      return {
        ...book,
        ...ratingData, // averageRating, numbering, rating 데이터가 도서 객체에 합쳐집니다.
        reviewer,
      };
    }),
  );

  return <SearchResultPage data={booksWithRating} title={decodedTitle} />;
}
