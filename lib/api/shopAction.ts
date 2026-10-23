"use server";

import { revalidatePath } from "next/cache";
import { SUPABASE_TABLES } from "../supabase/table";
import { createClient } from "@/lib/supabase/server";
import { Book } from "@/types/book";

// 1. 장바구니 목록 전체 조회
export async function ShopDataBase() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data: shopItems, error } = await supabase
    .from(SUPABASE_TABLES.SHOP_DATA)
    .select("*")
    .eq("user_id", user.id); // 유저 본인 데이터만 조회

  return {
    data: shopItems || [],
    total: shopItems?.length ?? 0,
    error,
  };
}

// 2. 장바구니 아이템 추가
export async function addToCartApi(item: Book) {
  try {
    const supabase = await createClient(); // Next.js server client (async)

    // 1. 유저 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "로그인이 필요합니다." };
    }

    // 2. DB Insert (요청하신 필드 추가)
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SHOP_DATA)
      .insert({
        user_id: user.id,
        title: item.title,
        thumbnail: item.thumbnail,
        authors: Array.isArray(item.authors)
          ? item.authors.join(", ")
          : item.authors,
        price: item.price, // 가격 데이터
        numbering: 1, // 고정값 1 지정
        isbn: item.isbn,
      })
      .select();

    if (error) {
      console.error("📛 Supabase AddShop Insert Error:", error.message);
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("📛 AddShop Unexpected Error:", err);
    return { error: err.message || "장바구니 추가 중 오류가 발생했습니다." };
  }
}
// 3. 장바구니 아이템 수량/정보 업데이트
export async function UpdateShop(item: Book) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from(SUPABASE_TABLES.SHOP_DATA)
    .update({
      numbering: item.numbering,
    })
    .eq("isbn", item.isbn)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// 4. 장바구니 아이템 삭제
export async function removeFromCartApi(book: Book) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // thumbnail 값이 없는 경우 처리
  if (!book.thumbnail) {
    return { error: "삭제할 상품 정보가 올바르지 않습니다." };
  }

  const { error } = await supabase
    .from(SUPABASE_TABLES.SHOP_DATA)
    .delete()
    .eq("user_id", user.id)
    .eq("thumbnail", book.thumbnail); // 🎯 user_id와 thumbnail이 모두 일치하는 행만 삭제

  if (error) {
    console.error("Error removing shop item:", error.message);
    return { error: "장바구니 삭제에 실패했습니다." };
  }

  revalidatePath("/bestseller");
  return { success: true };
}

// 5. 중복 여부에 따른 추가/업데이트 메인 함수
export async function ShopDBAdd(items: Book[] | Book) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const itemsArray = Array.isArray(items) ? items : [items];

  const results = await Promise.all(
    itemsArray.map(async (item) => {
      const { data: existingItem, error: checkError } = await supabase
        .from(SUPABASE_TABLES.SHOP_DATA)
        .select("id, isbn")
        .eq("isbn", item.isbn)
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        return { error: "중복 확인 중 오류가 발생했습니다." };
      }

      if (existingItem) {
        const updateResult = await UpdateShop(item);

        if (updateResult.error)
          return { status: "error", message: updateResult.error };

        return {
          status: "duplicate",
          message: "이미 장바구니에 있는 상품입니다.",
        };
      } else {
        const addResult = await AddShop(item);

        if (addResult.error) {
          return { status: "error", message: addResult.error };
        }

        return {
          status: "added",
          message: "상품이 장바구니에 추가되었습니다.",
        };
      }
    }),
  );

  revalidatePath("/bestseller");

  return { results };
}
