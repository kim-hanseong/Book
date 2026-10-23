"use server";

import { SUPABASE_TABLES } from "../supabase/table";

import { createClient } from "@/lib/supabase/server";
import { Book } from "@/types/book";
import { comment } from "@/types/comment";

export async function ReadPost(
  title: string,
  isbn: string,
): Promise<comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.POST)
    .select("*")
    .eq("title", title)
    .eq("isbn", isbn)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ReadPost Error:", error);

    return [];
  }

  // data가 null일 수 있으므로 (data ?? []) 처리와 타입 단언(as comment[]) 사용
  return (data ?? []) as comment[];
}

export async function AddPost(item: Book, content: string, rating: number) {
  const supabase = await createClient();

  // 1. 현재 로그인한 유저 정보 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 2. 로그인되지 않았거나 유저 정보가 없으면 처리 중단
  if (authError || !user) {
    return {
      data: null,
      error: new Error("로그인이 필요합니다."),
    };
  }

  // 3. 로그인된 유저의 정보를 포함하여 데이터 추가
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.POST)
    .insert([
      {
        title: item.title,
        isbn: item.isbn,
        Comment: content,
        rating: 4,
        email: user.email, // 실제 로그인한 유저의 이메일 저장
      },
    ])
    .select();

  return {
    data: data ? data[0] : null,
    error,
  };
}

export async function DeletePost(id: number) {
  const supabase = await createClient();

  // 1. 로그인한 유저 세션 검증
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: new Error("로그인이 필요합니다."),
    };
  }

  // 2. id 및 작성자 본인 여부(user_id) 확인 후 삭제
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.POST)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id) // 🎯 타인의 글을 지우지 못하도록 본인 ID 조건 추가
    .select();

  if (error) {
    console.error("DeletePost 실패:", error);

    return { data: null, error };
  }

  return { data, error: null };
}

export async function ReadUserPost() {
  const supabase = await createClient();

  // 1. 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 사용자가 로그인하지 않은 경우 empty 배열 반환
  if (!user) return [];

  // 2. 로그인한 유저의 user_id 조건(.eq)을 추가하여 조회
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.POST)
    .select("*")
    .eq("user_id", user.id) // 💡 로그인된 유저의 아이디로 필터링 (컬럼명이 auth_id 또는 user_id 인지 확인)
    .order("created_at", { ascending: false })
    .limit(3); // 💡 최대 3개만 조회

  if (error) {
    console.error("Failed to read user post:", error);

    return [];
  }

  return data;
}
