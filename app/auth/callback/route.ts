import { NextResponse } from "next/server";
// 👇 이 부분이 중요합니다. actions.ts와 동일한 클라이언트를 가져와야 합니다.
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient(); // ✅ OK
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 코드를 교환하는 데 실패하면 여기로 옵니다.
  console.error("Auth code exchange failed");
  return NextResponse.redirect(
    new URL("/login?message=인증에 실패했습니다.", request.url)
  );
}
