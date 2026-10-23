"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
// 👇 체크포인트 1: 반드시 'server'용 클라이언트를 import 해야 합니다.
import { createClient } from "@/lib/supabase/server";

export async function kakaoLogin() {
  // 👇 체크포인트 2: 여기서 클라이언트를 생성합니다.
  const supabase = createClient();
  const origin = headers().get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      // 이 주소는 Supabase 대시보드에도 등록되어 있어야 합니다.
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=로그인 서버에 연결할 수 없습니다.");
  }

  // 성공 시 카카오 인증 페이지로 리디렉션
  return redirect(data.url);
}
