"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { AuthContext } from "./AuthContext";
import type { User, Session } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchUserData = useCallback(async (userId: string, jwtTenantId?: string) => {
    try {
      const { data, error } = await supabase
        .from("clinic_users")
        .select("tenant_id, role")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (error || !data) {
        console.error("[Auth] Error fetching user data:", error);
        setRole(null);
        setTenantId(jwtTenantId ?? null);
        return;
      }

      setRole(data.role);
      setTenantId(data.tenant_id ?? jwtTenantId ?? null);
    } catch (err) {
      console.error("[Auth] Unexpected error:", err);
      setRole(null);
      setTenantId(jwtTenantId ?? null);
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
          const jwtTenantId = initialSession.user.user_metadata?.tenant_id as string | undefined;
          await fetchUserData(initialSession.user.id, jwtTenantId);
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
          const jwtTenantId = newSession.user.user_metadata?.tenant_id as string | undefined;
          await fetchUserData(newSession.user.id, jwtTenantId);
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
