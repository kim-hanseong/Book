"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type SupabaseContext = {
  supabase: typeof supabase;
  session: Session | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function AuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(serverSession);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <Context.Provider value={{ supabase, session }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used within a AuthProvider.");
  }

  return context;
};
