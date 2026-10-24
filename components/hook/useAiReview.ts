import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Book } from "@/types/book";
import { PersonaItem } from "@/constants/main/AiReviewSelect";
import { createPost } from "@/lib/supabase/supabase";
import { AiReviewItem } from "@/types/aireviewitem";
import { AddUserAiReviewer } from "@/lib/api/userAiState";

interface UseAiReviewParams {
  bookData: Book;
  authorText: string;
  lang: string;
  activePersona: PersonaItem;
  selectedPersonaId: string;
  fallbackText?: string;
}

export function useAiReview({
  bookData,
  authorText,
  lang,
  activePersona,
  selectedPersonaId,
  fallbackText = "리뷰를 불러오는 중 오류가 발생했습니다.",
}: UseAiReviewParams) {
  const queryClient = useQueryClient();
  const [reviewStatus, setReviewStatus] = useState<
    "idle" | "error" | "loading" | "success"
  >("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [personaRating, setPersonaRating] = useState<number | null>(null);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshHistory = () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", bookData?.title, bookData?.isbn],
    });
  };

  const stopTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
  };

  const startTypingEffect = (fullText: string) => {
    setDisplayedText("");
    stopTyping();

    let index = 0;

    typingTimerRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
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

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: bookData?.id,
          bookTitle: bookData?.title || bookData?.id || "Book",
          author: authorText,
          lang: lang || "ko",
          persona: activePersona,
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

      setPersonaRating(computedRating);
      setReviewStatus("success");

      // AI 리뷰 데이터
      const aiReview: AiReviewItem = {
        reviewer: selectedPersonaId,
        rating: computedRating,
        Comment: reviewComment,
      };

      await AddUserAiReviewer(activePersona.id);

      // 리뷰 상세 저장
      await createPost({
        title: bookData?.title || "",
        reviewer: aiReview.reviewer,
        rating: aiReview.rating,
        Comment: aiReview.Comment || "", // 👈 undefined일 경우 빈 문자열 처리
        isbn: bookData?.isbn || "", // 👈 undefined일 경우 빈 문자열 처리 (bookData가 undefined일 수도 있으니 ?. 사용 권장)
      });
      startTypingEffect(reviewComment);
      refreshHistory();
    } catch (error) {
      console.error("Failed to generate or save review:", error);
      setPersonaRating(0);
      setReviewStatus("success");
      startTypingEffect(fallbackText);
    }
  };

  return {
    reviewStatus,
    displayedText,
    personaRating,
    handleGenerateReview,
    stopTyping,
    refreshHistory,
  };
}
