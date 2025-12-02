import { Permission } from "./permissions";

export interface UserPermissions {
  roleIds: string[]; // User's role IDs from database
  permissions: Permission[]; // Effective permissions (with inheritance resolved)
}

export function hasPermission(
  userPermissions: UserPermissions,
  permission: Permission
): boolean {
  // Check if user has permission from their DB roles
  return userPermissions.permissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: UserPermissions,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

export function hasAllPermissions(
  userPermissions: UserPermissions,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Check if user has a specific role by ID
 */
export function hasRoleId(
  userPermissions: UserPermissions,
  roleId: string
): boolean {
  return userPermissions.roleIds.includes(roleId);
}

/**
 * Check if user has any of the specified role IDs
 */
export function hasAnyRoleId(
  userPermissions: UserPermissions,
  roleIds: string[]
): boolean {
  return roleIds.some((roleId) => hasRoleId(userPermissions, roleId));
}

/**
 * Check if user has all of the specified role IDs
 */
export function hasAllRoleIds(
  userPermissions: UserPermissions,
  roleIds: string[]
): boolean {
  return roleIds.every((roleId) => hasRoleId(userPermissions, roleId));
}

/** Returns effective permissions (already calculated from DB with inheritance) */
export function getEffectivePermissions(
  userPermissions: UserPermissions
): Permission[] {
  return userPermissions.permissions;
}

export function isAdmin(userPermissions: UserPermissions): boolean {
  // Check if user has admin panel access permission
  return hasPermission(userPermissions, Permission.ADMIN_PANEL_ACCESS);
}

export function isSuperAdmin(userPermissions: UserPermissions): boolean {
  // Super admin has all permissions
  const allPermissions = Object.values(Permission);
  return hasAllPermissions(userPermissions, allPermissions);
}
