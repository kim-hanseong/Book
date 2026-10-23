"use server";
import { revalidatePath } from "next/cache"; // ✨ 데이터 변경 후 UI 갱신을 위해 추가

import { SUPABASE_TABLES } from "../supabase/table";

import { createClient } from "@/lib/supabase/server"; // ✨ 서버용 클라이언트를 사용합니다.
import { Book } from "@/types/book";

export async function LikeDataBase() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: updatedLikes, error } = await supabase
    .from(SUPABASE_TABLES.LIKES)
    .select("*");

  return {
    data: updatedLikes || [],
    total: updatedLikes?.length ?? 0,
    error,
  };
}

export const addLike = async (data: Book) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인되지 않은 경우 에러 반환
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from(SUPABASE_TABLES.LIKES)
    .insert({ title: data.title, isbn: data.isbn }); // user_id를 명시적으로 전달

  if (error) {
    // 이미 좋아요를 눌렀을 때 발생하는 unique 제약 조건 위반 등
    // 에러 상황을 클라이언트에 알려줄 수 있습니다.
    if (error.code === "23505") {
      // unique_violation
      return { error: "이미 처리되었습니다." };
    }

    return { error: "좋아요 추가에 실패했습니다." };
  }

  // 3. 데이터가 변경되었으므로, 이 경로의 캐시를 무효화하여 UI를 갱신합니다.
  revalidatePath("/bestseller"); // 또는 해당 페이지 경로

  return { success: true };
};

// 좋아요 취소 함수도 같은 방식으로 만들 수 있습니다.
export const RemoveLikeDataBase = async (book: Book) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from(SUPABASE_TABLES.LIKES)
    .delete()
    .eq("isbn", book.isbn);

  if (error) {
    console.error("Error removing like:", error.message);
    return { error: "좋아요 취소에 실패했습니다." };
  }

  revalidatePath("/bestseller");
  return { success: true };
};

export async function ReadLike() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data } = await supabase
    .from(SUPABASE_TABLES.LIKES)

    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return data;
}
