"use server";

import { SUPABASE_TABLES } from "../supabase/table";

import { Book } from "@/types/book";
import { createClient } from "@/lib/supabase/server";
import { AiReviewItem } from "@/types/aireviewitem";

/**
 * 1. ISBN 기준 평점이 높고 최신순인 AI 리뷰 상위 3개 가져오기
 */
export async function getTopAiReviewers(isbn: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AiRiview)
      .select("*")
      .eq("isbn", isbn)
      .order("rating", { ascending: false })
      .limit(3);

    if (error) {
      console.error("📛 Supabase GetTopAiReviewers Error:", error.message);

      return [];
    }

    return data ?? [];
  } catch (err: unknown) {
    console.error("📛 GetTopAiReviewers Unexpected Error:", err);

    return [];
  }
}

/**
 * 2. AI 리뷰 추가 (동일 ISBN + name 조합이 이미 존재하면 저장 건너뜀)
 */
export async function addaiReviewer(item: Book, ai: AiReviewItem) {
  try {
    const supabase = await createClient();

    // [중복 검사] 동일한 isbn과 캐릭터 이름(name)의 리뷰가 이미 있는지 확인
    const { data: existing, error: checkError } = await supabase
      .from(SUPABASE_TABLES.AiRiview)
      .select("id")
      .eq("isbn", item.isbn)
      .eq("name", ai.reviewer);

    if (checkError) {
      console.error("📛 Supabase Duplicate Check Error:", checkError.message);
    }

    // 이미 등록된 캐릭터 리뷰가 있다면 추가하지 않고 반환
    if (existing) {
      return {
        success: true,
        skipped: true,
        message: "이미 해당 도서에 대한 이 캐릭터의 리뷰가 존재합니다.",
      };
    }

    // 중복이 없을 때만 Insert 진행
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AiRiview)
      .insert({
        title: item.title,
        isbn: item.isbn,
        name: ai.reviewer,
        rating: ai.rating,
      })
      .select();

    if (error) {
      console.error("📛 Supabase AddAiReviewer Insert Error:", error.message);

      return { error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error("📛 AddAiReviewer Unexpected Error:", err);
  }
}
