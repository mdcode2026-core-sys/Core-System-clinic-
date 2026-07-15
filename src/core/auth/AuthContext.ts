"use client";

import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { UserRole } from "@/core/permissions/types";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  tenantId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
