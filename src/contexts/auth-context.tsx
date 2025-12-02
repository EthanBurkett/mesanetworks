"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "@/hooks";
import type { UserResponse } from "@/lib/api/auth";

interface AuthContextType {
  user: UserResponse | undefined;
  permissions: string[];
  roleIds: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();

  const value: AuthContextType = {
    user,
    permissions: user?.permissions || [],
    roleIds: user?.roleIds || [],
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
