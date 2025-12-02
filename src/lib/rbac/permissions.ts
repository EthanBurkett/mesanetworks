export enum Permission {
  // User Management
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_LIST = "user:list",

  // Role Management
  ROLE_READ = "role:read",
  ROLE_CREATE = "role:create",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",
  ROLE_ASSIGN = "role:assign",

  // Session Management
  SESSION_READ_OWN = "session:read:own",
  SESSION_READ_ANY = "session:read:any",
  SESSION_REVOKE_OWN = "session:revoke:own",
  SESSION_REVOKE_ANY = "session:revoke:any",

  // Admin Permissions
  ADMIN_PANEL_ACCESS = "admin:panel:access",
  SYSTEM_SETTINGS = "system:settings",
  AUDIT_LOG_READ = "audit:log:read",
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
  GUEST = "GUEST",
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions

  [Role.ADMIN]: [
    // User Management
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_LIST,
    // Role Management (limited)
    Permission.ROLE_READ,
    Permission.ROLE_ASSIGN,
    // Session Management
    Permission.SESSION_READ_OWN,
    Permission.SESSION_READ_ANY,
    Permission.SESSION_REVOKE_OWN,
    Permission.SESSION_REVOKE_ANY,
    // Admin Access
    Permission.ADMIN_PANEL_ACCESS,
    Permission.AUDIT_LOG_READ,
  ],

  [Role.MODERATOR]: [
    Permission.USER_READ,
    Permission.USER_LIST,
    Permission.SESSION_READ_OWN,
    Permission.SESSION_REVOKE_OWN,
    Permission.AUDIT_LOG_READ,
  ],

  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE, // Own profile
    Permission.SESSION_READ_OWN,
    Permission.SESSION_REVOKE_OWN,
  ],

  [Role.GUEST]: [
    Permission.USER_READ,
    Permission.USER_UPDATE, // Own profile
    Permission.SESSION_READ_OWN,
    Permission.SESSION_REVOKE_OWN,
  ],
};

export function isPermission(value: string): value is Permission {
  return Object.values(Permission).includes(value as Permission);
}

export function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] || [];
}

export function getPermissionsForRoles(roles: Role[]): Permission[] {
  const permissions = new Set<Permission>();
  roles.forEach((role) => {
    getPermissionsForRole(role).forEach((permission) =>
      permissions.add(permission)
    );
  });
  return Array.from(permissions);
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) || false;
}

export function rolesHavePermission(
  roles: Role[],
  permission: Permission
): boolean {
  return roles.some((role) => roleHasPermission(role, permission));
}
