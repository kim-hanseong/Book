// components/layOut/User.tsx (AuthProvider)

"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

// getUser 함수는 더 이상 필요 없을 수 있습니다.
// import { checkLogin, getUser, supabase } from "@/lib/supabase/supabase";
import { supabase } from "@/lib/supabase/supabase"; // getUser 제거
import { User } from "@supabase/supabase-js"; // User 타입은 그대로 사용

// initialUser 타입을 서버 컴포넌트의 user 타입과 동일하게 User | null 로 변경 권장
interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null; // <-- 타입 변경
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  // initialUser를 초기값으로 설정
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    // onAuthStateChange에서 session 객체를 직접 활용
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // _event는 SIGNED_IN, SIGNED_OUT 등 이벤트 타입
        // session 객체 안에 user 정보가 있습니다.
        setUser(session?.user || null); // 세션이 없거나 유저가 없으면 null
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // 의존성 배열은 비워두어 컴포넌트 마운트 시 한 번만 실행되도록 함

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
