"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { AuthContext } from "./AuthContext";
import type { User, Session } from "@supabase/supabase-js";
import type { UserRole } from "@/core/permissions/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("clinic_users")
        .select("role, tenant_id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[Auth] Error fetching user data:", error);
        setRole(null);
        setTenantId(null);
        return;
      }

      setRole((data?.role as UserRole) ?? null);
      setTenantId(data?.tenant_id ?? null);
    } catch (err) {
      console.error("[Auth] Unexpected error:", err);
      setRole(null);
      setTenantId(null);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchUserData(initialSession.user.id);
        }
      } catch (err) {
        console.error("[Auth] Init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchUserData(newSession.user.id);
        } else {
          setRole(null);
          setTenantId(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const value = {
    user,
    session,
    role,
    tenantId,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
