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

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("tenant_id, role_id, roles(role_key)")
        .eq("auth_user_id", userId)
        .single();

      if (error || !data) {
        console.error("[Auth] Error fetching user data:", error);
        setRole(null);
        setTenantId(null);
        return;
      }

      const roleKey = Array.isArray(data.roles) && data.roles.length > 0 
        ? data.roles[0].role_key 
        : null;

      setRole(roleKey);
      setTenantId(data.tenant_id ?? null);
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
