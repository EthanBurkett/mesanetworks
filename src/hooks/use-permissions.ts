import { useAuth } from "@/contexts/auth-context";
import { Permission, Role, RoleHierarchy } from "@/lib/rbac/permissions";

/**
 * Client-side permission checking hooks
 * These work with the permissions array from the auth context
 * Permissions include inherited permissions from role hierarchy
 */

/**
 * Check if the current user has a specific permission
 * @param permission - Permission to check (from Permission enum)
 * @returns true if user has the permission (including inherited permissions)
 *
 * @example
 * const canManageUsers = useHasPermission(Permission.USER_UPDATE);
 */
export function useHasPermission(permission: Permission): boolean {
  const { permissions } = useAuth();
  return permissions.includes(permission);
}

/**
 * Check if the current user has at least one of the specified permissions
 * @param permissionsToCheck - Array of permissions to check
 * @returns true if user has ANY of the permissions
 *
 * @example
 * const canViewAnyReports = useHasAnyPermission([
 *   Permission.MANAGER_REPORT_TIMESHEET_ANY,
 *   Permission.ADMIN_REPORT_TIMESHEET_ANY
 * ]);
 */
export function useHasAnyPermission(permissionsToCheck: Permission[]): boolean {
  const { permissions } = useAuth();
  return permissionsToCheck.some((perm) => permissions.includes(perm));
}

/**
 * Check if the current user has all of the specified permissions
 * @param permissionsToCheck - Array of permissions to check
 * @returns true if user has ALL of the permissions
 *
 * @example
 * const canFullyManageUsers = useHasAllPermissions([
 *   Permission.USER_CREATE,
 *   Permission.USER_UPDATE,
 *   Permission.USER_DELETE
 * ]);
 */
export function useHasAllPermissions(
  permissionsToCheck: Permission[]
): boolean {
  const { permissions } = useAuth();
  return permissionsToCheck.every((perm) => permissions.includes(perm));
}

/**
 * Check if the current user has a specific role by ID
 * @param roleId - Role ID to check
 * @returns true if user has the role
 */
export function useHasRoleId(roleId: string): boolean {
  const { roleIds } = useAuth();
  return roleIds.includes(roleId);
}

/**
 * Check if the current user has at least one of the specified role IDs
 * @param roleIdsToCheck - Array of role IDs to check
 * @returns true if user has ANY of the roles
 */
export function useHasAnyRoleId(roleIdsToCheck: string[]): boolean {
  const { roleIds } = useAuth();
  return roleIdsToCheck.some((id) => roleIds.includes(id));
}

/**
 * Check if the current user has all of the specified role IDs
 * @param roleIdsToCheck - Array of role IDs to check
 * @returns true if user has ALL of the roles
 */
export function useHasAllRoleIds(roleIdsToCheck: string[]): boolean {
  const { roleIds } = useAuth();
  return roleIdsToCheck.every((id) => roleIds.includes(id));
}

/**
 * Check if the current user meets or exceeds a minimum role hierarchy level
 * This checks if the user's highest hierarchy level is >= the required role's level
 * @param requiredRole - Required role (from Role enum)
 * @returns true if user's highest hierarchy meets or exceeds the requirement
 *
 * @example
 * import { Role } from '@/lib/rbac/permissions';
 * // Check if user is at least EMPLOYEE level - includes EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN
 * const hasEmployeeAccess = useHasRoleHierarchy(Role.EMPLOYEE);
 *
 * @example
 * // Check if user is at least MANAGER level
 * const hasManagerAccess = useHasRoleHierarchy(Role.MANAGER);
 */
export function useHasRoleHierarchy(requiredRole: Role): boolean {
  const { roles } = useAuth();
  if (roles.length === 0) return false;

  const requiredHierarchy = RoleHierarchy[requiredRole];
  if (requiredHierarchy === undefined) return false;

  const maxHierarchy = Math.max(...roles.map((role) => role.hierarchyLevel));
  return maxHierarchy >= requiredHierarchy;
}

/**
 * Check if the current user has admin access
 * @returns true if user has admin panel access permission
 *
 * @example
 * const isAdmin = useIsAdmin();
 * if (isAdmin) {
 *   // Show admin UI
 * }
 */
export function useIsAdmin(): boolean {
  const { permissions } = useAuth();
  return permissions.includes(Permission.ADMIN_PANEL_ACCESS);
}

/**
 * Check if the current user is a super admin
 * Super admins have all available permissions
 * @returns true if user has all permissions
 */
export function useIsSuperAdmin(): boolean {
  const { permissions } = useAuth();
  const allPermissions = Object.values(Permission);
  return allPermissions.every((perm) => permissions.includes(perm));
}

/**
 * Get all effective permissions for the current user
 * Includes inherited permissions from role hierarchy
 * @returns Array of Permission strings
 */
export function usePermissions(): Permission[] {
  const { permissions } = useAuth();
  return permissions as Permission[];
}

/**
 * Get all role IDs for the current user
 * @returns Array of role ID strings
 */
export function useRoleIds(): string[] {
  const { roleIds } = useAuth();
  return roleIds;
}

/**
 * Higher-order hook that returns a permission checker function
 * Useful for dynamic permission checks
 * @returns Function to check permissions
 *
 * @example
 * const checkPermission = usePermissionChecker();
 * const canEdit = checkPermission(Permission.USER_UPDATE);
 */
export function usePermissionChecker() {
  const { permissions } = useAuth();
  return (permission: Permission): boolean => permissions.includes(permission);
}

/**
 * Hook for conditional rendering based on permission
 * Returns an object with permission state and loading state
 * @param permission - Permission to check
 * @returns Object with hasPermission and isLoading flags
 *
 * @example
 * const { hasPermission, isLoading } = usePermissionGuard(Permission.USER_UPDATE);
 * if (isLoading) return <Spinner />;
 * if (!hasPermission) return null;
 * return <EditButton />;
 */
export function usePermissionGuard(permission: Permission) {
  const { permissions, isLoading } = useAuth();
  return {
    hasPermission: permissions.includes(permission),
    isLoading,
  };
}

/**
 * Hook for conditional rendering based on any of multiple permissions
 * @param permissionsToCheck - Array of permissions to check
 * @returns Object with hasPermission and isLoading flags
 */
export function useAnyPermissionGuard(permissionsToCheck: Permission[]) {
  const { permissions, isLoading } = useAuth();
  return {
    hasPermission: permissionsToCheck.some((perm) =>
      permissions.includes(perm)
    ),
    isLoading,
  };
}

/**
 * Hook for conditional rendering based on all of multiple permissions
 * @param permissionsToCheck - Array of permissions to check
 * @returns Object with hasPermission and isLoading flags
 */
export function useAllPermissionsGuard(permissionsToCheck: Permission[]) {
  const { permissions, isLoading } = useAuth();
  return {
    hasPermission: permissionsToCheck.every((perm) =>
      permissions.includes(perm)
    ),
    isLoading,
  };
}

/**
 * Check if current user can manage (has higher hierarchy than) a target user
 * Note: This requires the target user's role information
 * @param targetUserRoleIds - Role IDs of the target user
 * @returns true if current user can manage the target user
 *
 * Note: Actual hierarchy comparison should be done server-side for security
 * This is for UI hints only
 */
export function useCanManageUser(targetUserRoleIds: string[]): boolean {
  const { roleIds, permissions } = useAuth();

  // Super admins can manage anyone
  if (useIsSuperAdmin()) {
    return true;
  }

  // If user has role assignment permission
  if (permissions.includes(Permission.ROLE_ASSIGN)) {
    // Can manage if not the same user (prevent self-role-change)
    // Full hierarchy check should be done server-side
    return !targetUserRoleIds.every((id) => roleIds.includes(id));
  }

  return false;
}
