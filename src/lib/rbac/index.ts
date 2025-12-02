// Main RBAC exports
export { Permission, Role } from "./permissions";
export type {} from "./permissions";
export { isPermission, isRole } from "./permissions";

// Database role utilities
export {
  getUserPermissions,
  getRoleHierarchyLevel,
  roleIsAtLeast,
  updateRoleHierarchy,
  getRolesByHierarchy,
  getInheritedRoles,
  validateInheritance,
} from "./role-utils";

// Permission checker utilities
export type { UserPermissions } from "@/lib/rbac/permission-checker";
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleId,
  hasAnyRoleId,
  hasAllRoleIds,
  getEffectivePermissions,
  isAdmin,
  isSuperAdmin,
} from "@/lib/rbac/permission-checker";
