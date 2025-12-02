// Main RBAC exports
export { Permission, Role } from "./permissions";
export type {} from "./permissions";
export {
  getPermissionsForRole,
  getPermissionsForRoles,
  roleHasPermission,
  rolesHavePermission,
  isPermission,
  isRole,
} from "./permissions";

// Permission checker utilities
export type { UserPermissions } from "@/lib/rbac/permission-checker";
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getEffectivePermissions,
  isAdmin,
  isSuperAdmin,
} from "@/lib/rbac/permission-checker";
