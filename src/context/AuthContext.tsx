"use client";

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  isAuthLoading: boolean;
  authEpoch: number;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // ユーザーIDが切り替わるたびに増やし、同じユーザーが再ログインした場合も
  // 以前のログインセッションで取得したクライアント状態を再利用しないための世代番号。
  const [authEpoch, setAuthEpoch] = useState(0);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    // INITIAL_SESSION イベントが購読直後に発火するため、初期状態の取得もここで行われる
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;
      if (nextUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = nextUserId;
        setAuthEpoch((current) => current + 1);
      }
      setUser(nextUser);
      setIsAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <AuthContext value={{ user, isAuthLoading, authEpoch, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
