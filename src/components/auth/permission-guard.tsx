"use client";

import { ReactNode } from "react";
import {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
} from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  fallback?: ReactNode;
  showFallbackOnLoading?: boolean;
}

/**
 * Component for conditional rendering based on permissions
 * Supports checking for a single permission, any of multiple permissions, or all of multiple permissions
 *
 * @example
 * // Single permission check
 * <PermissionGuard permission={Permission.USER_UPDATE}>
 *   <EditUserButton />
 * </PermissionGuard>
 *
 * @example
 * // Any of multiple permissions
 * <PermissionGuard
 *   anyPermissions={[Permission.MANAGER_READ_SHIFT_ANY, Permission.ADMIN_READ_SHIFT_ANY]}
 * >
 *   <ViewShiftsButton />
 * </PermissionGuard>
 *
 * @example
 * // All of multiple permissions with fallback
 * <PermissionGuard
 *   allPermissions={[Permission.USER_CREATE, Permission.USER_UPDATE]}
 *   fallback={<AccessDeniedMessage />}
 * >
 *   <ManageUsersPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  showFallbackOnLoading = false,
}: PermissionGuardProps) {
  const hasSinglePermission = useHasPermission(permission!);
  const hasAnyOfPermissions = useHasAnyPermission(anyPermissions || []);
  const hasAllOfPermissions = useHasAllPermissions(allPermissions || []);

  // Determine which check to use based on props
  let hasAccess = false;

  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyOfPermissions;
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllOfPermissions;
  } else {
    // No permissions specified, deny access by default
    console.warn(
      "PermissionGuard: No permissions specified. Use permission, anyPermissions, or allPermissions prop."
    );
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component for admin-only content
 * Shorthand for checking Permission.ADMIN_PANEL_ACCESS
 *
 * @example
 * <AdminOnly>
 *   <AdminDashboard />
 * </AdminOnly>
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permission={Permission.ADMIN_PANEL_ACCESS}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Component for super admin-only content
 *
 * @example
 * <SuperAdminOnly>
 *   <DangerousSettings />
 * </SuperAdminOnly>
 */
export function SuperAdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  // Super admins have all permissions - check for multiple critical permissions
  return (
    <PermissionGuard
      allPermissions={[
        Permission.ADMIN_PANEL_ACCESS,
        Permission.SYSTEM_SETTINGS,
        Permission.ROLE_CREATE,
        Permission.ROLE_UPDATE,
        Permission.ROLE_DELETE,
      ]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
