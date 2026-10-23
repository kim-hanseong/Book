"use server";

import { SUPABASE_TABLES } from "../supabase/table";

import { createClient } from "@/lib/supabase/server";
import { Book } from "@/types/book";

export async function ReadRating(title: string, isbn: string) {
  const supabase = await createClient();

  const targetIsbn = isbn;

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Rating)
    .select("*")
    .eq("isbn", targetIsbn)
    .maybeSingle();

  if (error || !data) {
    return {
      averageRating: 0,
      numbering: 0,
      rating: 0,
    };
  }

  const numbering = data.numbering || 0;
  const ratingSum = data.rating || 0;

  // 0으로 나누기 방지 및 소수점 첫째 자리까지 계산 (예: 4.3)
  const averageRating =
    numbering > 0 ? Number((ratingSum / numbering).toFixed(1)) : 0;

  return {
    ...data,
    averageRating, // 계산된 평균 평점 (예: 4.3)
  };
}

export async function AddRating(item: Book, rating: number) {
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

  const targetIsbn = item.isbn;
  // 3. 기존 테이블에 동일한 isbn 데이터가 있는지 확인
  const { data: existingPost, error: selectError } = await supabase
    .from(SUPABASE_TABLES.Rating)
    .select("*")
    .eq("isbn", targetIsbn)
    .maybeSingle(); // 데이터가 없어도 에러(406)를 던지지 않고 null을 반환합니다.

  if (selectError) {
    return {
      data: null,
      error: selectError,
    };
  }

  // 4-A. 이미 데이터가 존재하는 경우 -> numbering + 1, rating 누적 업데이트 (UPDATE)
  if (existingPost) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.Rating)
      .update({
        numbering: (existingPost.numbering || 0) + 1,
        rating: (existingPost.rating || 0) + rating,
        // 필요할 경우 최신 content나 기타 속성도 함께 업데이트 가능
      })
      .eq("id", existingPost.id)
      .select();

    return {
      data: data ? data[0] : null,
      error,
    };
  }

  // 4-B. 데이터가 없는 경우 -> numbering = 1, rating = 전달된 rating 신규 등록 (INSERT)
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Rating)
    .insert([
      {
        title: item.title,
        isbn: targetIsbn,
        numbering: 1,
        rating: 4,
        // user_id: user.id, // 로그인 유저 ID 저장이 필요하다면 주석 해제
      },
    ])
    .select();

  return {
    data: data ? data[0] : null,
    error,
  };
}
