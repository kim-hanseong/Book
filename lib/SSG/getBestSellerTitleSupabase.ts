import { supabase } from "../supabase/supabase";

// 1. 카테고리별 베스트셀러 제목 목록을 가져오는 함수
export async function getBestSellerTitlesFromSupabase(category: string) {
  const data = await Best_Book_DB(category);

  if (!data) {
    return [];
  }

  return data.map((item: { title: string }) => item.title);
}

// 2. Supabase에서 해당 카테고리(테이블) 데이터를 조회하는 함수
export async function Best_Book_DB(category: string) {
  const { data, error } = await supabase
    .from(category)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("ReadPost Error:", error);
    return [];
  }

  return data;
}
