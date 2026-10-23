"use server";

import { SUPABASE_TABLES } from "../supabase/table";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/address";

// 기본 배송지 데이터를 바로 반환하는 함수
export async function AddressDataBase(): Promise<Address | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    console.error(error.message);

    return null;
  }

  return (data as Address) || null;
}
export async function AddAddressDataBase(
  item: Address,
): Promise<Address | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 💡 1. 새로 추가되는 주소가 기본(is_default: true)이 되므로,
  // 기존에 기본 배송지로 설정되어 있던 항목들을 모두 false로 변경합니다.
  const { error: resetError } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  if (resetError) {
    console.error("기본 배송지 초기화 실패:", resetError.message);

    return null;
  }

  // 💡 2. 새로운 주소를 is_default: true로 안전하게 삽입합니다.
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .insert([
      {
        user_id: user.id,
        recipient_name: item.recipient_name,
        phone_number: item.phone_number,
        addressinfo: item.addressinfo,
        addressdetailinfo: item.addressdetailinfo,
        address_name: item.address_name,
        is_default: true, // 새로 추가된 주소가 기본 배송지
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("배송지 추가 실패:", error.message);

    return null;
  }

  return data as Address;
}
export async function getAddressList(): Promise<Address[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false }); // is_default가 true인 항목이 맨 위로 오도록 정렬

  if (error) {
    console.error(error.message);

    return [];
  }

  return (data as Address[]) || [];
}

export async function updateDefaultAddress(targetId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 1. 해당 유저의 기존 기본 배송지(is_default: true)를 모두 false로 변경
  const { error: resetError } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  if (resetError) {
    console.error(resetError.message);

    return false;
  }

  // 2. 사용자가 새로 선택한 항목의 is_default를 true로 변경
  const { error: updateError } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .update({ is_default: true })
    .eq("id", targetId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error(updateError.message);

    return false;
  }

  return true;
}

export async function deleteAddress(targetId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 해당 주소 삭제 (본인 소유의 주소인지 user_id로 안전하게 검증)
  const { error } = await supabase
    .from(SUPABASE_TABLES.Addres)
    .delete()
    .eq("id", targetId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);

    return false;
  }

  return true;
}
