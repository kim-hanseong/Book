//* Library */
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js"; // SupabaseClient 타입 임포트

//* type */
import { BookDataType, BooksData } from "@/types/il8n";

// createBrowserClient는 App Router 환경에서 클라이언트 컴포넌트, Route Handlers, Server Actions에서
// 유니버설하게(어디서든) 사용할 수 있는 클라이언트를 생성합니다.
// 이 클라이언트는 OAuth 로그인 후 쿠키를 올바르게 설정하여 서버 컴포넌트에서도 인증 상태를 알 수 있게 해줍니다.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
export async function signInWithKakao(): Promise<void> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
    });

    if (error) {
      console.error("Error signing in with Kakao:", error.message);

      return;
    }
    console.log("Kakao sign-in successful:", data);
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

export async function ReadLikeDataBase(): Promise<BooksData> {
  const { data: record, error } = await supabase.from("Like").select("*");

  return { data: record || [], total: record ? record.length : null, error };
}

// LikeList 함수도 SupabaseClient를 인자로 받도록 수정 (필요하다면)
export const LikeList = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.from("Like").select("*");

  if (error) {
    throw new Error("Error fetching data.");
  }

  return data;
};
export const AddLikeDataBase = async (data: BookDataType) => {
  // 1. 현재 로그인된 세션 확인
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { error: "로그인이 필요합니다." };
  }

  const userId = session.user.id;

  // 2. user_id를 명시적으로 포함해서 insert
  const { error } = await supabase.from("Like").insert({
    title: data.title,
    isbn: data.isbn,
    user_id: userId, // 🔥 이걸 반드시 넣어줘야 RLS 정책 통과
  });

  if (error) {
    console.error("Error adding like:", error.message);
    if (error.code === "23505") {
      return { error: "이미 처리되었습니다." };
    }

    return { error: "좋아요 추가에 실패했습니다." };
  }

  return { success: true };
};
export async function RemoveLikeDataBase(
  data: BookDataType,
): Promise<{ success: true } | { error: string }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error: deleteError } = await supabase
    .from("Like")
    .delete()
    .eq("isbn", data.isbn)
    .eq("user_id", user.id); // 사용자 본인의 좋아만 삭제

  if (deleteError) {
    console.error("Error removing like:", deleteError.message);

    return { error: "좋아요 삭제 중 오류가 발생했습니다." };
  }

  return { success: true };
}

// --------------------------- Shop 테이블 관련 함수 ---------------------------*/
export async function ReadSupaBase(userid?: string): Promise<BooksData> {
  const { data: record, error } = await supabase.from("Shop").select("*");

  return { data: record || [], total: record ? record.length : null, error };
}

export async function DeleteSupaBase(
  id: number,
): Promise<{ success: boolean; error?: unknown }> {
  const { data, error } = await supabase.from("Shop").delete().eq("id", id);

  if (error) return { success: false, error };

  return { success: true };
}

export const ShopDBAdd = async (items: BookDataType[] | BookDataType) => {
  try {
    const { data: records, error: readError } = await ReadSupaBase();

    if (readError) return { error: readError };

    const existingRecords = records || [];
    const itemsArray = Array.isArray(items) ? items : [items];

    const results = await Promise.all(
      itemsArray.map(async (item) => {
        const existingItem = existingRecords.find(
          (recordItem: BookDataType) => recordItem.isbn === item.isbn,
        );

        if (existingItem) {
          return await updateItemInDatabase(item, existingItem);
        } else {
          return await addItemToDatabase(item);
        }
      }),
    );

    return { results };
  } catch (error) {
    console.error("Unexpected error:", error);

    return { error };
  }
};

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

  console.log("가져옴");

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
  const { data, error } = await supabase
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
