import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/mypage", "/order"];

  // 1. 비로그인 유저가 보호된 경로 접근 시 -> error 쿼리 파라미터 전달
  if (!session && protectedPaths.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();

    url.pathname = "/login"; // 경로 이동
    url.searchParams.set("error", "unauthorized"); // 쿼리 추가

    return NextResponse.redirect(url);
  }

  // 2. 이미 로그인한 유저가 /login, /register 접근 시
  if (session && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();

    url.pathname = "/";
    url.searchParams.set("error", "already_logged_in");

    return NextResponse.redirect(url); // rewrite 대신 redirect 권장
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
