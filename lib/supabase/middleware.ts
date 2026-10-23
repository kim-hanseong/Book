import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 👇 request를 인자로 받습니다.
export const createMiddlewareClient = (
  request: NextRequest,
  { supabaseUrl, supabaseKey }: { supabaseUrl: string; supabaseKey: string }
) => {
  let response: NextResponse | undefined = undefined;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // request 객체를 복제해서 쿠키를 설정하고, 새로운 response를 만듭니다.
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // request와 response 객체 모두에서 쿠키를 삭제합니다.
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  return { supabase, response };
};
