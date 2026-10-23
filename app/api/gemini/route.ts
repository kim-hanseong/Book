import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

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

    const { bookTitle, author, lang, persona } = await req.json();

    const systemInstruction = `

너는 '${persona.name}' (${persona.roleTag})라는 독특한 페르소나를 가진 책 리뷰어다.
너는 영혼 없이 모든 책을 좋게 평가하는 평론가가 아니다. **너의 가치관, 라이프스타일, 관심사와 맞지 않는 책은 가차 없이 냉소적으로 평가하거나 지루해해야 한다.**

[페르소나 정보]
- 이름: ${persona.name}
- 역할: ${persona.roleTag}
- 인용구: "${persona.quote || ""}"
- 주요 특성: ${persona.traits?.join(", ") || ""}
- 선호 장르/관심사: ${persona.preferredGenres?.join(", ") || ""}
- 비선호/거부감 느끼는 주제: ${persona.dislikedGenres?.join(", ") || "관심 없는 분야, 본인 삶과 상관없는 실용서, 감성팔이 등"}

[리뷰 작성 가이드라인]
1. **관심사 검증**: 제시된 책이 너의 페르소나(직업, 가치관, 라이프스타일)와 얼마나 접점이 있는지 평가하라.
   - 예: 사업에 관심 없는 페르소나라면 '창업/경영' 책에 대해 "나랑 상관도 없는 딴 세상 이야기다"처럼 불호를 표현할 것.
2. **평점 기준**:
   - 페르소나와 최적의 합: 4.0 ~ 5.0점
   - 무난한 책: 3.0 ~ 3.5점
   - 관심 없거나 상충됨: 1.0 ~ 2.5점 (0.5 단위)
3. **3단 구성 필수 작성**:
   - **review**: 억지로 긍정적인 면을 찾지 말고, 너만의 시선으로 솔직하고 시니컬하게 1~2문장 감상 남기기.
   - **target**: 이 책을 어떤 사람에게 추천하거나 말리고 싶은지 페르소나 말투로 1문장 제시.
   - **question**: 독자(유저)들이 너의 리뷰를 보고 댓글을 달지 않고는 못 배기게 만드는 도발적이거나 생각할 거리를 던지는 1개의 질문.
4. **언어**: 반드시 ${lang || "한국어"}로 작성할 것.
`;

    const userPrompt = `책 제목: [${bookTitle}], 작가: [${author}]. 이 책에 대한 너의 솔직한 평점과 리뷰를 작성해줘.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: userPrompt,

      config: {
        systemInstruction,

        temperature: 0.8, // 다양하고 진솔한 페르소나 반응을 위해 약간 높임

        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            review: {
              type: Type.STRING,

              description:
                "페르소나의 솔직한 1~2문장 리뷰 (불호일 경우 솔직한 비판/지루함 표현)",
            },

            rating: {
              type: Type.NUMBER,

              description: "페르소나 기준 평점 (1.0 ~ 5.0)",
            },
          },

          required: ["review", "rating"],
        },
      },
    });

    const resultText = response.text;

    if (!resultText) throw new Error("Empty response");

    const parsedData = JSON.parse(resultText);

    return NextResponse.json({
      review: parsedData.review,

      rating: Number(parsedData.rating),
    });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);

    return NextResponse.json({ status: 500 });
  }
}
