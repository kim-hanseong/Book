"use server";

import { createClient } from "@/lib/supabase/server";
import { SUPABASE_TABLES } from "../supabase/table";
import { Book } from "@/types/book";
import { Address } from "@/types/address";

export async function ReadOrder() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data } = await supabase
    .from(SUPABASE_TABLES.Order)

    .select("*")
    .order("created_at", { ascending: false })
    .eq("delivery", false);

  return data;
}
export async function EndOrder() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { data } = await supabase
    .from(SUPABASE_TABLES.Order)

    .select("*")
    .order("created_at", { ascending: false })
    .eq("delivery", true)
    .limit(3);

  return data;
}
export async function AddOrder(data: Book, address: Address, number: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 1. address가 undefined일 때의 예외 처리 추가
  if (!address) {
    return { error: "배송지 정보가 없습니다." };
  }

  const { error } = await supabase.from(SUPABASE_TABLES.Order).insert({
    // 2. LIKES -> ORDERS로 변경 확인
    user_id: user.id, // 3. 누락되었던 user_id 추가
    title: data.title,
    isbn: data.isbn,
    numbering: number,
    Phone: address.phone_number,
    Address: address.addressinfo,
    AddressInfo: address.addressdetailinfo,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 처리되었습니다." };
    }

    return { error: "주문 추가에 실패했습니다." };
  }

  return { success: true };
}
