import FocusPage from "@/components/page/focus";
import { ReadPost } from "@/lib/api/postAction";
import { ReadRating } from "@/lib/api/ratingAction";
import { UserAiReviewerDataBase } from "@/lib/api/userAiState";
import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { fetchPostByTitleAndThumbnail } from "@/lib/supabase/supabase";
import { Book } from "@/types/book";

async function Page({
  params,
}: {
  params: Promise<{
    isbn: string;
    title: string;
  }>;
}) {
  const { isbn, title } = await params;
  const decodedIsbn = decodeURIComponent(isbn);
  const decodedTitle = decodeURIComponent(title);

  const [bestSellerData, reviewData, commentData, userState, totalRating] =
    await Promise.all([
      KakaoBookSearch(decodedTitle),
      fetchPostByTitleAndThumbnail(decodedTitle, decodedIsbn),
      ReadPost(decodedTitle, decodedIsbn),
      UserAiReviewerDataBase(),
      ReadRating(decodedTitle, decodedIsbn),
    ]);

  const matchedBook = bestSellerData.find((book: Book) =>
    book.isbn.includes(decodedIsbn),
  );

  return (
    <FocusPage
      data={matchedBook}
      AiReviewData={reviewData}
      CommentData={commentData}
      UserState={userState}
      TotalRating={totalRating}
    />
  );
}

export default Page;
