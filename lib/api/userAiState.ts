"use server"; // (참고: 서버 액션 파일이므로 "use server"가 맞습니다!)

import { createClient } from "@/lib/supabase/server";
import { ReviewerType } from "@/types/aireviewitem";

// 💡 반환될 객체의 타입 인터페이스 정의
// 💡 반환될 객체의 타입 인터페이스 정의
export interface UserReviewerStatItem {
  reviewer: ReviewerType;
  rating: number;
}

export async function UserAiReviewerDataBase(): Promise<
  UserReviewerStatItem[]
> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_reviewer_stats")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);

    return [];
  }

  const reviewerColumns: ReviewerType[] = [
    "curator_silent",
    "analyst_sharp",
    "naruto_slugcat",
    "relatable_stream",
    "dreamer_cloud",
  ];

  const topReviewers: UserReviewerStatItem[] = reviewerColumns
    .map((reviewer) => ({
      reviewer,
      rating: Number(data?.[0]?.[reviewer] ?? 0),
    }))
    .filter((item) => item.rating > 0)
    .sort((a, b) => b.rating - a.rating) // 💡 깨져 있던 연산자 수정 (-)
    .slice(0, 3);

  return topReviewers;
}

export async function AddUserAiReviewer(ai: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  // 1. 해당 유저의 기존 통계 데이터 조회
  const { data: existingData, error: fetchError } = await supabase
    .from("user_reviewer_stats")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError };
  }

  // 2. 데이터가 존재하는 경우 -> 기존 데이터에 +1 업데이트
  if (existingData) {
    const currentCount = Number(existingData[ai] ?? 0);

    const { data, error: updateError } = await supabase
      .from("user_reviewer_stats")
      .update({
        [ai]: currentCount + 1,
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) return { success: false, error: updateError };

    return { success: true, data, error: null };
  }

  // 3. 데이터가 없는 경우 -> 신규 행 삽입
  const { data, error: insertError } = await supabase
    .from("user_reviewer_stats")
    .insert({
      user_id: user.id,
      [ai]: 1,
      email: "gd",
    })
    .select()
    .single();

  if (insertError) return { success: false, error: insertError };

  return { success: true, data, error: null };
}
