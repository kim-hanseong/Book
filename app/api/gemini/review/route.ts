import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { KakaoBookSearch } from "@/lib/kakao/bookApi"; // 💡 카카오 도서 검색 함수 임포트 (프로젝트 경로 확인)

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server API Key Missing" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const { lang, persona, dislikedBooks } = await req.json();

    const systemInstruction = `
너는 '${persona.name}' (${persona.roleTag})라는 독특한 페르소나를 가진 도서 추천가다.

[말투 및 톤앤매너 - 매우 중요!]
- **오글거리거나 시적이고 거창한 표현 절대 금지**: "음으로 가득 찬 세상", "영혼을 고요히 관조", "구원" 같은 거창한 허세 섞인 문체는 절대 쓰지 마라.
- **담백하고 현실적인 어조**: 2030세대가 친구나 독서 모임 멤버에게 말하듯 담백하고, 때로는 날카롭거나 위트 있게 말하라.
- **책 제목 직접 언급 필수**: review(코멘트) 텍스트 안에서 **네가 추천할 책 3권의 제목을 반드시 자연스럽게 포함시켜서 설명해라.** (예: "이번엔 <책제목1>, <책제목2>, 그리고 <책제목3>을 골라봤어. 쓸데없는 감성팔이 없이 깔끔하게 읽기 좋을 거야.")

[페르소나 정보]
- 이름: ${persona.name}
- 역할: ${persona.roleTag}
- 인용구: "${persona.quote || ""}"
- 주요 특성: ${persona.traits?.join(", ") || ""}
- 선호 장르/관심사: ${persona.preferredGenres?.join(", ") || ""}
- 비선호/거부감 느끼는 주제: ${persona.dislikedGenres?.join(", ") || "관심 없는 분야, 실용서, 감성팔이 등"}

[유저의 비선호 데이터 (피해야 할 장르/주제)]
${
  dislikedBooks && dislikedBooks.length > 0
    ? dislikedBooks
        .map(
          (b: { title: string; rating?: number }) =>
            `- 비선호 도서: [${b.title}] (평점: ${b.rating || "낮음"})`,
        )
        .join("\n")
    : "- 특별히 등록된 비선호 도서 없음"
}

[도서 추천 가이드라인]
1. **취향 필터링**: 페르소나의 성향과 어울리는 책 3권을 고르되, 유저가 낮은 평점을 준 책들의 장르/분위기는 완전히 배제하라.
2. **review**: 네가 고른 **추천 도서 3권의 제목을 문장 안에 직접 언급**하면서, 왜 이 책들을 골랐는지 담백하게 2~3문장으로 코멘트를 작성하라.
3. **recommendations**: 추천 도서 제목 정확히 3개 (순수 문자열 배열)
4. **언어**: 반드시 ${lang || "한국어"}로 작성할 것.
4. 지금 넘겨준 호평된 책들을 기반으로 분석해줘.

`;

    const userPrompt = `나의 취향과 페르소나 성향에 어울리는 추천 도서 3권의 제목을 언급하며 추천 코멘트를 작성해줘.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            review: {
              type: Type.STRING,
              description:
                "추천 도서 3권의 제목이 문장 안에 자연스럽게 포함된 2~3문장 추천 코멘트",
            },
            recommendations: {
              type: Type.ARRAY,
              description: "추천 도서 제목 3개 (순수 문자열 배열)",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["review", "recommendations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response");

    const parsedData = JSON.parse(resultText);
    const recommendationTitles: string[] = parsedData.recommendations || [];

    // 💡 1. Gemini가 뽑아준 책 제목 3개로 KakaoBookSearch 병렬 호출
    const recommendedBooks = await Promise.all(
      recommendationTitles.map(async (title) => {
        try {
          const searchResults = await KakaoBookSearch(title);
          // 검색 결과 중 가장 연관도가 높은 첫 번째 책(표지, 저자, ISBN 등 포함) 반환
          return searchResults?.[0] || { title };
        } catch (error) {
          console.error(
            `Failed to fetch Kakao book data for title: ${title}`,
            error,
          );
          return { title };
        }
      }),
    );

    // 💡 2. 프론트엔드에 리뷰 텍스트, 제목 배열, 카카오 상세 도서 객체 배열을 함께 응답
    return NextResponse.json({
      review: parsedData.review,
      recommendations: recommendationTitles, // ["이방인", "물고기는 존재하지 않는다", ...]
      recommendedBooks, // [{ title: "이방인", thumbnail: "...", authors: [...], ... }, ...]
    });
  } catch (error: any) {
    console.error("Gemini Recommendation API Error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 },
    );
  }
}
