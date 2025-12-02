import {
  Permission,
  Role,
  getPermissionsForRoles,
  rolesHavePermission,
} from "./permissions";

export interface UserPermissions {
  roles: Role[]; // Kept for backward compatibility, but now mostly unused
  permissions: Permission[]; // Actual permissions from DB roles
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

export function hasRole(userPermissions: UserPermissions, role: Role): boolean {
  return userPermissions.roles.includes(role);
}

export function hasAnyRole(
  userPermissions: UserPermissions,
  roles: Role[]
): boolean {
  return roles.some((role) => hasRole(userPermissions, role));
}

export function hasAllRoles(
  userPermissions: UserPermissions,
  roles: Role[]
): boolean {
  return roles.every((role) => hasRole(userPermissions, role));
}

/** Returns effective permissions (already calculated from DB) */
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
