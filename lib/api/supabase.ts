// server/supabaseClient.ts (서버 전용, service_role 사용 가능한 곳)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // ex. https://xyz.supabase.co
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 절대 클라이언트에 노출하지 마세요

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  db: { schema: "public" }, // 기본 스키마 지정
});
