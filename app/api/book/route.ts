// import { KakaoBookSearch } from "@/lib/kakao/bookApi";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { persona, shopData, lang, dislikedBooks } = body;

//     // 1. Gemini API를 호출해서 리뷰와 추천 책 제목 배열(recommendations)을 받아오는 로직
//     // (예시: geminiResult 안에 review, rating, recommendations가 들어있다고 가정)
//     const geminiResult = /* await 제미나이 호출 코드 */;

//     const reviewComment = geminiResult.review || "";
//     const ratingVal = geminiResult.rating || 4;
//     const recTitles: string[] = geminiResult.recommendations || []; // 예: ["클린 코드", "리팩터링"]

//     // 2. 💡 질문자님이 만드신 KakaoBookSearch에 title들을 각각 집어넣어 데이터 조회
//     const recommendedBooks = await Promise.all(
//       recTitles.map(async (title) => {
//         try {
//           return await KakaoBookSearch(title); // 만드신 함수 호출!
//         } catch (error) {
//           console.error(`Kakao search error for "${title}":`, error);
//           return null;
//         }
//       })
//     );

//     // 검색 실패(null)한 항목 제거
//     const validBooks = recommendedBooks.filter((book) => book !== null);

//     // 3. 훅이 기대하는 이름(recommendedBooks)으로 응답 반환
//     return NextResponse.json({
//       review: reviewComment,
//       rating: ratingVal,
//       recommendations: recTitles,
//       recommendedBooks: validBooks, // 👉 이 데이터가 프론트 훅의 result.recommendedBooks로 들어갑니다!
//     });

//   } catch (error: any) {
//     console.error("API Route Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { KakaoBookSearch } from "@/lib/kakao/bookApi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 클라이언트 훅(useAirecommend)에서 전달받은 body 파싱
    const body = await req.json();
    const { persona, shopData, lang } = body;

    // 2. 더미 리뷰 및 더미 책 제목 3개 설정
    const dummyReview =
      "이 책방은 고요하고 아늑해서 몰입하기 정말 좋네요. 페르소나의 취향에 맞춰 엄선한 세 권의 책을 추천해 드립니다!";
    const dummyRating = 5;
    const dummyRecommendations = [
      "클린 코드",
      "리팩터링",
      "모던 자바스크립트 Deep Dive",
    ];

    // 3. 만드신 KakaoBookSearch에 책 제목 3개를 넘겨서 카카오 책 데이터 가져오기
    const recommendedBooks = await Promise.all(
      dummyRecommendations.map(async (title) => {
        try {
          return await KakaoBookSearch(title);
        } catch (error) {
          console.error(`Error searching book "${title}":`, error);
          return null;
        }
      }),
    );

    // 검색 결과 중 null 값 필터링
    const validBooks = recommendedBooks.filter((book) => book !== null);

    // 4. 프론트엔드 훅(useAirecommend)의 result 규격에 맞게 반환
    return NextResponse.json({
      review: dummyReview,
      rating: dummyRating,
      recommendations: dummyRecommendations,
      recommendedBooks: validBooks, // 훅의 setRecommendedBooks 로 들어갑니다.
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
