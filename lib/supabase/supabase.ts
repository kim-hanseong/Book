//* Library */
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js"; // SupabaseClient 타입 임포트

//* type */

// createBrowserClient는 App Router 환경에서 클라이언트 컴포넌트, Route Handlers, Server Actions에서
// 유니버설하게(어디서든) 사용할 수 있는 클라이언트를 생성합니다.
// 이 클라이언트는 OAuth 로그인 후 쿠키를 올바르게 설정하여 서버 컴포넌트에서도 인증 상태를 알 수 있게 해줍니다.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
export async function signInWithKakao(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
    });

    if (error) {
      console.error("Error signing in with Kakao:", error.message);

      return;
    }
  } catch (err) {
    console.error("Unexpected error during Kakao sign-in:", err);
  }
}
//*--------------------------- 좋아요 테이블 관련  ---------------------------*/

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("로그아웃 중 오류가 발생했습니다:", error.message);

    return { success: false, error };
  }

  return { success: true };
}

export async function checkLogin() {
  const authInfo = await supabase.auth.getSession();

  return authInfo.data?.session;
}

// --------------------------- Shop 테이블 관련 함수 ---------------------------*/

export const DeleteShopDB = async (id: number) => {
  const { data, error } = await supabase.from("Shop").delete().eq("id", id);

  if (error) {
    throw new Error("Error deleting data.");
  }

  return data;
};

export const DeleteOrderShopDB = async (titles: string[]) => {
  const { data, error } = await supabase
    .from("Shop")
    .delete()
    .in("title", titles);

  if (error) {
    throw new Error("Shop 데이터 삭제 중 오류 발생");
  }

  return data;
};

//*--------------------------- Best 테이블 관련 함수 ---------------------------*/
export async function Best_Book_DB(
  DB: string,
  sorting: "추천일순" | "출판일순" = "출판일순", // 기본값 설정
): Promise<{
  data: BookDataType[] | null;
  total: number | null;
  error: unknown;
}> {
  const pageNumber = 1;
  const pageSize = 8;
  const offset = (pageNumber - 1) * pageSize;

  let query = supabase
    .from(`${DB}`)
    .select("*")
    .range(offset, offset + pageSize - 1);

  if (sorting === "추천일순") {
    query = query.order("id", { ascending: false });
  } else if (sorting === "출판일순") {
    query = query.order("publicationdate", { ascending: false });
  }

  const { data: record, error: dataError } = await query;

  return { data: record, total: null, error: dataError };
}
//*--------------------------- Posts 테이블 관련 함수 ---------------------------*/
export const fetchPostBySlug = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, rating , content")
    .order("like", { ascending: false }) // like 많은 순으로 정렬
    .limit(5); // 상위 5개만

  if (error) {
    throw new Error("Error fetching post.");
  }

  return data;
};

export type SortType = "최신순" | "별점높은순" | "별점낮은순";

export const fetchPostBySlug2 = async (
  slug: string,
  sort: SortType = "최신순",
) => {
  let query = supabase.from("posts").select("*").eq("slug", slug);

  // 정렬 조건 적용
  if (sort === "최신순") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "별점높은순") {
    query = query.order("rating", { ascending: false });
  } else if (sort === "별점낮은순") {
    query = query.order("rating", { ascending: true });
  }

  // 상위 5개만 가져오기
  query = query.limit(5);

  const { data, error } = await query;

  if (error) {
    throw new Error("Error fetching post.");
  }

  return data;
};

export const DeleteSlugDB = async (id: number) => {
  const { data, error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error("Error deleting data.");
  }

  return data;
};

export const addPost = async (
  slug: string,
  content: string,
  rating: number,
  email: string,
) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ slug, content, rating, email }])
    .single();

  if (error) {
    throw new Error(`Error adding post: ${error.message}`);
  }

  return data;
};

//*--------------------------- Helper 함수 ---------------------------*/
const addItemToDatabase = async (item: BookDataType) => {
  const { data, error } = await supabase.from("Shop").insert([
    {
      title: item.title,
    },
  ]);

  if (error) {
    console.error("Error adding item to database:", error.message);
  }

  return { data, error };
};

const updateItemInDatabase = async (
  item: BookDataType,
  existingItem: BookDataType,
) => {
  const newNumbering = (existingItem.numbering ?? 0) + 1;
  const { error } = await supabase
    .from("Shop")
    .update({ numbering: newNumbering })
    .eq("isbn", item.isbn);

  if (error) {
    console.error("Error updating item in database:", error.message);
  }
};

// lib/supabase/supabase.ts

export async function fetchPostByTitleAndThumbnail(
  title: string,
  isbn: string,
) {
  const { data, error } = await supabase
    .from("Comment")
    .select("*")
    .eq("title", title)
    .eq("isbn", isbn)
    .order("created_at", { ascending: false })
    .limit(5); // 👈 여기에 5개 제한 추가

  if (error) {
    console.error("Supabase 조회 실패:", error);

    return [];
  }

  return data;
}

export interface CreatePostParams {
  title: string; // 책 제목
  Comment: string; // AI가 작성한 리뷰 내용
  reviewer: string; // 작성자 ID (예: persona_id 또는 user_id)
  rating: number;
  isbn: string;
}

export const createPost = async ({
  title,
  Comment,
  reviewer,
  rating,
  isbn,
}: CreatePostParams) => {
  const { data, error } = await supabase
    .from("Comment")
    .insert([
      {
        title,
        Comment, // DB 컬럼명이 'comment' 또는 'content'인지 확인 필요
        reviewer,
        rating,
        isbn,
      },
    ])
    .select() // 삽입된 레코드 전체 데이터 반환
    .single();

  if (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post.");
  }

  return data;
};

export async function fetchReviewer(title: string, isbn: string) {
  const { data, error } = await supabase
    .from("Comment")
    .select("*")
    .eq("title", title)
    .eq("isbn", isbn)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Supabase 조회 실패:", error);

    return { reviewer: [] };
  }

  // data 대신 reviewer 키를 가진 객체로 반환
  return { reviewer: data };
}
