export enum Permission {
  // User Management
  USER_READ = "user:read",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_LIST = "user:list",
  USER_LIST_LIMITED = "user:list:limited",

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

  // Settings Permissions
  SETTINGS_READ = "settings:read",
  SETTINGS_WRITE = "settings:write",

  // Email Permissions
  EMAIL_SEND = "email:send",
  EMAIL_TEMPLATE_READ = "email:template:read",
  EMAIL_TEMPLATE_CREATE = "email:template:create",
  EMAIL_TEMPLATE_UPDATE = "email:template:update",
  EMAIL_TEMPLATE_DELETE = "email:template:delete",
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export function isPermission(value: string): value is Permission {
  return Object.values(Permission).includes(value as Permission);
}

export function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

/**
 * Default permissions for system roles
 * Used during role initialization only
 */
export const SystemRolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_LIST,
    Permission.ROLE_READ,
    Permission.ROLE_ASSIGN,
    Permission.SESSION_READ_OWN,
    Permission.SESSION_READ_ANY,
    Permission.SESSION_REVOKE_OWN,
    Permission.SESSION_REVOKE_ANY,
    Permission.ADMIN_PANEL_ACCESS,
    Permission.AUDIT_LOG_READ,
    Permission.EMAIL_SEND,
    Permission.EMAIL_TEMPLATE_READ,
    Permission.EMAIL_TEMPLATE_CREATE,
    Permission.EMAIL_TEMPLATE_UPDATE,
    Permission.EMAIL_TEMPLATE_DELETE,
  ],
  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SESSION_READ_OWN,
    Permission.SESSION_REVOKE_OWN,
    Permission.USER_LIST_LIMITED,
  ],
};
