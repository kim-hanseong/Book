"use server";

import { SUPABASE_TABLES } from "../supabase/table";

import { createClient } from "@/lib/supabase/server";
import { Book } from "@/types/book";
import { Address } from "@/types/address";
import { OrderItem } from "@/components/page/mypage";

export async function ReadOrder(): Promise<OrderItem[] | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  // 💡 현재 시간 기준 3일 전(72시간 전) 날짜 계산
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Order)
    .select("*")
    .eq("delivery", false)
    .gte("created_at", threeDaysAgo) // 💡 3일 이내에 생성된 데이터만 조회 (3일 지난 건 제외)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { error: "주문 목록을 불러오지 못했습니다." };
  }

  return (data as OrderItem[]) || [];
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
