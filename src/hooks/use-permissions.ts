import { useAuth } from "@/contexts/auth-context";

/**
 * Client-side permission checking hooks
 * These work with the permissions array from the auth context
 * No server-side RBAC imports needed
 */

export function useHasPermission(permission: string): boolean {
  const { permissions } = useAuth();
  return permissions.includes(permission as any);
}

export function useHasAnyPermission(permissionsToCheck: string[]): boolean {
  const { permissions } = useAuth();
  return permissionsToCheck.some((perm) => permissions.includes(perm as any));
}

export function useHasAllPermissions(permissionsToCheck: string[]): boolean {
  const { permissions } = useAuth();
  return permissionsToCheck.every((perm) => permissions.includes(perm as any));
}

export function useHasRoleId(roleId: string): boolean {
  const { roleIds } = useAuth();
  return roleIds.includes(roleId);
}

export function useHasAnyRoleId(roleIdsToCheck: string[]): boolean {
  const { roleIds } = useAuth();
  return roleIdsToCheck.some((id) => roleIds.includes(id));
}

export function useHasAllRoleIds(roleIdsToCheck: string[]): boolean {
  const { roleIds } = useAuth();
  return roleIdsToCheck.every((id) => roleIds.includes(id));
}

export function useIsAdmin(): boolean {
  const { permissions } = useAuth();
  return permissions.includes("admin:panel:access" as any);
}

export function useIsSuperAdmin(): boolean {
  const { permissions } = useAuth();
  // Super admin has all permissions - you can check for a specific permission
  // or implement a better check based on your needs
  return permissions.length > 15; // Rough check - adjust as needed
}

/**
 * Get all effective permissions for the current user
 */
export function usePermissions() {
  const { permissions } = useAuth();
  return permissions;
}

/**
 * Get all role IDs for the current user
 */
export function useRoleIds() {
  const { roleIds } = useAuth();
  return roleIds;
}
