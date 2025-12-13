# Client-Side Permission Hooks

## Overview

Client-side permission checking hooks that work with the role-based access control (RBAC) system. These hooks automatically include **inherited permissions** from the role hierarchy, so permissions from lower-level roles are automatically available to higher-level roles.

## Permission Inheritance

The system uses role hierarchy levels:

- **SUPER_ADMIN** (5) - Inherits all permissions
- **ADMIN** (4) - Inherits MANAGER + EMPLOYEE + USER permissions
- **MANAGER** (3) - Inherits EMPLOYEE + USER permissions
- **EMPLOYEE** (2) - Inherits USER permissions
- **USER** (1) - Base permissions only

When you check for a permission, the system automatically includes inherited permissions, so you don't need to check for every role level.

## Basic Permission Checks

### useHasPermission

Check if the user has a specific permission (including inherited permissions).

```tsx
import { useHasPermission } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function EditUserButton() {
  const canEdit = useHasPermission(Permission.USER_UPDATE);

  if (!canEdit) return null;

  return <button>Edit User</button>;
}
```

### useHasAnyPermission

Check if the user has **at least one** of the specified permissions.

```tsx
import { useHasAnyPermission } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function ViewReportsButton() {
  const canViewReports = useHasAnyPermission([
    Permission.MANAGER_REPORT_TIMESHEET_ANY,
    Permission.ADMIN_REPORT_TIMESHEET_ANY,
  ]);

  return canViewReports ? <button>View Reports</button> : null;
}
```

### useHasAllPermissions

Check if the user has **all** of the specified permissions.

```tsx
import { useHasAllPermissions } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function FullUserManagement() {
  const hasFullAccess = useHasAllPermissions([
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ]);

  return hasFullAccess ? <UserManagementPanel /> : <ReadOnlyView />;
}
```

## Role Checks

### useHasRoleId

Check if user has a specific role by database ID.

```tsx
import { useHasRoleId } from "@/hooks";

function AdminBadge({ adminRoleId }: { adminRoleId: string }) {
  const isAdmin = useHasRoleId(adminRoleId);
  return isAdmin ? <Badge>Admin</Badge> : null;
}
```

### useHasAnyRoleId / useHasAllRoleIds

Check for multiple role IDs.

```tsx
import { useHasAnyRoleId, useHasAllRoleIds } from "@/hooks";

function StaffArea({ managerRoleId, adminRoleId }) {
  const isStaff = useHasAnyRoleId([managerRoleId, adminRoleId]);
  return isStaff ? <StaffDashboard /> : null;
}
```

### useHasRoleHierarchy

Check if user meets or exceeds a minimum role hierarchy level. This is useful when you want to grant access to anyone at a certain level or above (e.g., "EMPLOYEE and above").

```tsx
import { useHasRoleHierarchy } from "@/hooks";
import { Role } from "@/lib/rbac/permissions";

function EmployeeTools() {
  // Anyone with EMPLOYEE level or higher (EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN)
  const hasEmployeeAccess = useHasRoleHierarchy(Role.EMPLOYEE);

  return hasEmployeeAccess ? <EmployeeToolbar /> : null;
}

function ManagerDashboard() {
  // Only MANAGER and above (MANAGER, ADMIN, SUPER_ADMIN)
  const hasManagerAccess = useHasRoleHierarchy(Role.MANAGER);

  return hasManagerAccess ? <ManagerStats /> : <AccessDenied />;
}

function AdminPanel() {
  // Only ADMIN and above (ADMIN, SUPER_ADMIN)
  const hasAdminAccess = useHasRoleHierarchy(Role.ADMIN);
  return hasAdminAccess ? <AdminContent /> : null;
}
```

**Available Roles:**

- `Role.SUPER_ADMIN` - Highest level (hierarchy 5)
- `Role.ADMIN` - Admin level (hierarchy 4)
- `Role.MANAGER` - Manager level (hierarchy 3)
- `Role.EMPLOYEE` - Employee level (hierarchy 2)
- `Role.USER` - Base user level (hierarchy 1)

**Note:** The hierarchy levels are looked up automatically from the role definition. If hierarchy levels change in the system, this function will automatically use the updated values. This is separate from permission-based checks - use this when you need role-level gating rather than specific permissions.

## Convenience Hooks

### useIsAdmin

Quick check for admin panel access.

```tsx
import { useIsAdmin } from "@/hooks";

function Navigation() {
  const isAdmin = useIsAdmin();

  return (
    <nav>
      <Link href="/">Home</Link>
      {isAdmin && <Link href="/admin">Admin Panel</Link>}
    </nav>
  );
}
```

### useIsSuperAdmin

Check if user is a super admin (has all permissions).

```tsx
import { useIsSuperAdmin } from "@/hooks";

function DangerousSettings() {
  const isSuperAdmin = useIsSuperAdmin();
  return isSuperAdmin ? <SystemSettings /> : <AccessDenied />;
}
```

## Advanced Hooks

### usePermissionChecker

Returns a permission checker function for dynamic checks.

```tsx
import { usePermissionChecker } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function DynamicActions() {
  const checkPermission = usePermissionChecker();

  const actions = [
    {
      label: "Edit",
      permission: Permission.USER_UPDATE,
      onClick: () => {},
    },
    {
      label: "Delete",
      permission: Permission.USER_DELETE,
      onClick: () => {},
    },
  ].filter((action) => checkPermission(action.permission));

  return (
    <>
      {actions.map((action) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  );
}
```

### usePermissionGuard

Returns permission state with loading indicator.

```tsx
import { usePermissionGuard } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function EditButton() {
  const { hasPermission, isLoading } = usePermissionGuard(
    Permission.USER_UPDATE
  );

  if (isLoading) return <Spinner />;
  if (!hasPermission) return null;

  return <button>Edit</button>;
}
```

### useAnyPermissionGuard / useAllPermissionsGuard

Guard hooks for multiple permissions.

```tsx
import { useAnyPermissionGuard } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function ReportsSection() {
  const { hasPermission, isLoading } = useAnyPermissionGuard([
    Permission.MANAGER_REPORT_TIMESHEET_ANY,
    Permission.ADMIN_REPORT_TIMESHEET_ANY,
  ]);

  if (isLoading) return <LoadingState />;
  if (!hasPermission) return <AccessDenied />;

  return <ReportsDashboard />;
}
```

## Permission Guard Components

### PermissionGuard

Declarative permission-based rendering.

```tsx
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Permission } from "@/lib/rbac/permissions";

// Single permission
<PermissionGuard permission={Permission.USER_UPDATE}>
  <EditUserButton />
</PermissionGuard>

// Any of multiple permissions
<PermissionGuard
  anyPermissions={[
    Permission.MANAGER_READ_SHIFT_ANY,
    Permission.ADMIN_READ_SHIFT_ANY
  ]}
>
  <ViewShiftsPanel />
</PermissionGuard>

// All permissions required
<PermissionGuard
  allPermissions={[
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE
  ]}
  fallback={<UpgradePrompt />}
>
  <FullUserManagement />
</PermissionGuard>
```

### AdminOnly

Shorthand for admin content.

```tsx
import { AdminOnly } from "@/components/auth/permission-guard";

<AdminOnly fallback={<AccessDenied />}>
  <AdminDashboard />
</AdminOnly>;
```

### SuperAdminOnly

Shorthand for super admin content.

```tsx
import { SuperAdminOnly } from "@/components/auth/permission-guard";

<SuperAdminOnly>
  <SystemConfigurationPanel />
</SuperAdminOnly>;
```

## Getting All Permissions

### usePermissions

Get all effective permissions (including inherited).

```tsx
import { usePermissions } from "@/hooks";

function PermissionsList() {
  const permissions = usePermissions();

  return (
    <ul>
      {permissions.map((perm) => (
        <li key={perm}>{perm}</li>
      ))}
    </ul>
  );
}
```

### useRoleIds

Get all role IDs for the current user.

```tsx
import { useRoleIds } from "@/hooks";

function UserRoles() {
  const roleIds = useRoleIds();
  return <div>User has {roleIds.length} roles</div>;
}
```

## Best Practices

### 1. Use Permission Enum

Always use the `Permission` enum instead of string literals:

```tsx
// ✅ Good
import { Permission } from "@/lib/rbac/permissions";
useHasPermission(Permission.USER_UPDATE);

// ❌ Bad
useHasPermission("user:update");
```

### 2. Trust Inheritance

Don't check for multiple role levels - inheritance handles it:

```tsx
// ✅ Good - checks once, inheritance handles the rest
const canViewShifts = useHasPermission(Permission.MANAGER_READ_SHIFT_ANY);

// ❌ Bad - unnecessary checks
const canViewShifts = useHasAnyPermission([
  Permission.MANAGER_READ_SHIFT_ANY,
  Permission.ADMIN_READ_SHIFT_ANY, // Already inherited!
]);
```

### 3. UI Hints Only

Client-side checks are for UI only. Always enforce permissions on the server:

```tsx
// Client side - UI hint
const canEdit = useHasPermission(Permission.USER_UPDATE);

// Server side - actual enforcement
export const updateUser = wrapper({
  requirePermission: Permission.USER_UPDATE,
  // ...
});
```

### 4. Use Components for Cleaner Code

Prefer `PermissionGuard` component over hooks for simple conditional rendering:

```tsx
// ✅ Good - declarative
<PermissionGuard permission={Permission.USER_UPDATE}>
  <EditButton />
</PermissionGuard>;

// ⚠️ Okay but verbose
function EditButtonWrapper() {
  const canEdit = useHasPermission(Permission.USER_UPDATE);
  if (!canEdit) return null;
  return <EditButton />;
}
```

## Common Patterns

### Conditional Menu Items

```tsx
import { useHasPermission } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function Navigation() {
  const canManageUsers = useHasPermission(Permission.USER_UPDATE);
  const canViewReports = useHasPermission(
    Permission.MANAGER_REPORT_TIMESHEET_ANY
  );

  return (
    <nav>
      <Link href="/">Home</Link>
      {canManageUsers && <Link href="/users">Users</Link>}
      {canViewReports && <Link href="/reports">Reports</Link>}
    </nav>
  );
}
```

### Conditional Form Fields

```tsx
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Permission } from "@/lib/rbac/permissions";

<form>
  <input name="name" />
  <input name="email" />

  <PermissionGuard permission={Permission.ROLE_ASSIGN}>
    <select name="role">
      <option>User</option>
      <option>Manager</option>
    </select>
  </PermissionGuard>
</form>;
```

### Loading States

```tsx
import { usePermissionGuard } from "@/hooks";
import { Permission } from "@/lib/rbac/permissions";

function ProtectedPage() {
  const { hasPermission, isLoading } = usePermissionGuard(
    Permission.ADMIN_PANEL_ACCESS
  );

  if (isLoading) return <PageSkeleton />;
  if (!hasPermission) return <Redirect to="/" />;

  return <AdminPanel />;
}
```

## TypeScript Support

All hooks are fully typed with TypeScript:

```tsx
import { Permission } from "@/lib/rbac/permissions";

// ✅ Type-safe
const canEdit: boolean = useHasPermission(Permission.USER_UPDATE);

// ❌ Type error - must use Permission enum
const canEdit = useHasPermission("invalid");
```
