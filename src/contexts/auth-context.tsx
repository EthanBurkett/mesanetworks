"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRoles, useUser } from "@/hooks";
import type { UserResponse, RoleResponse } from "@/lib/api/auth";

interface AuthContextType {
  user: UserResponse | undefined;
  permissions: string[];
  roleIds: string[];
  roles: RoleResponse[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();
  const roles = useRoles();
  const userRoles = React.useMemo(() => {
    if (!user || !roles.data) return [];
    const filtered = roles.data.filter((role) => user.roles.includes(role._id));
    console.log("Auth Debug:", {
      userRoleIds: user.roles,
      allRoles: roles.data.map((r) => ({
        id: r._id,
        name: r.name,
        hierarchy: r.hierarchyLevel,
      })),
      filteredRoles: filtered.map((r) => ({
        id: r._id,
        name: r.name,
        hierarchy: r.hierarchyLevel,
      })),
      userPermissions: user.permissions,
      userRoleIdsFromAPI: user.roleIds,
    });
    return filtered;
  }, [user, roles.data]);

  const value: AuthContextType = {
    user,
    permissions: user?.permissions || [],
    roleIds: user?.roleIds || [],
    roles: userRoles,
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
