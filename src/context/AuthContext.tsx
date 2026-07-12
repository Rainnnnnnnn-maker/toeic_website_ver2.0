"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    // INITIAL_SESSION イベントが購読直後に発火するため、初期状態の取得もここで行われる
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
    <AuthContext value={{ user, isAuthLoading, signOut }}>
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
