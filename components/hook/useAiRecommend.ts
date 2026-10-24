import { useState, useRef } from "react";

import { PersonaItem } from "@/constants/main/AiReviewSelect";
import { Book } from "@/types/book";

interface DislikedBookItem {
  title: string;
  rating?: number;
}

interface UseAiReviewParams {
  shopData?: Book;
  activePersona: PersonaItem;
  lang: string;
  selectedPersonaId?: string;
  fallbackText?: string;
  dislikedBooks?: DislikedBookItem[];
}

export function useAirecommend({
  shopData,
  activePersona,
  lang,
  dislikedBooks = [],
}: UseAiReviewParams) {
  const [reviewStatus, setReviewStatus] = useState("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [personaRating, setPersonaRating] = useState<number | null>(null);

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTyping = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  // 💡 맨 첫 글자 누락 방지 및 안정적인 타이핑 효과 함수
  const startTypingEffect = (fullText: string) => {
    stopTyping();
    setDisplayedText(""); // 1. 먼저 텍스트 상태 초기화

    if (!fullText) return;

    let index = 0;

    // 2. 타이머 시작
    typingTimerRef.current = setInterval(() => {
      if (index < fullText.length) {
        // prev 상태 의존성 없이 fullText.slice() 방식으로 정확히 가져오기
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        stopTyping();
      }
    }, 25);
  };

  const handleGenerateReview = async () => {
    if (reviewStatus === "loading") return;

    setReviewStatus("loading");
    setDisplayedText("");
    setPersonaRating(null);
    setRecommendations([]);
    setRecommendedBooks([]);

    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: activePersona,
          shopData,
          lang,
          dislikedBooks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          `API Error ${response.status}: ${
            errorData.error || errorData.message || response.statusText
          }`,
        );
      }

      const result = await response.json();

      const ratingVal = Number(result.rating);
      const computedRating = isNaN(ratingVal) ? 4 : Math.round(ratingVal);
      const reviewComment = result.review || "";

      const recTitles = result.recommendations || [];
      const recBooks = result.recommendedBooks || [];

      setPersonaRating(computedRating);
      setRecommendations(recTitles);
      setRecommendedBooks(recBooks);
      setReviewStatus("success");

      startTypingEffect(reviewComment);
    } catch (error) {
      console.error("Failed to generate or save review:", error);
      setPersonaRating(4);
      setReviewStatus("error");
    }
  };

  return {
    reviewStatus,
    displayedText,
    personaRating,
    recommendations,
    recommendedBooks,
    handleGenerateReview,
    stopTyping,
  };
}
