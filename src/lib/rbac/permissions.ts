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

  EMPLOYEE_CLOCK_SHIFT_OWN = "employee:clock:shift:own",
  EMPLOYEE_READ_SHIFT_OWN = "employee:read:shift:own",
  EMPLOYEE_UPDATE_SHIFT_OWN = "employee:update:shift:own",

  EMPLOYEE_READ_TIMESHEET_OWN = "employee:read:timesheet:own",

  MANAGER_READ_SHIFT_ANY = "manager:read:shift:any",
  MANAGER_UPDATE_SHIFT_ANY = "manager:update:shift:any",
  MANAGER_CREATE_SHIFT_ANY = "manager:create:shift:any",
  MANAGER_APPROVE_SHIFT_ANY = "manager:approve:shift:any",

  MANAGER_READ_TIMESHEET_ANY = "manager:read:timesheet:any",
  MANAGER_REPORT_TIMESHEET_ANY = "manager:report:timesheet:any",

  ADMIN_CREATE_SHIFT_ANY = "admin:create:shift:any",
  ADMIN_READ_SHIFT_ANY = "admin:read:shift:any",
  ADMIN_UPDATE_SHIFT_ANY = "admin:update:shift:any",
  ADMIN_DELETE_SHIFT_ANY = "admin:delete:shift:any",

  ADMIN_READ_TIMESHEET_ANY = "admin:read:timesheet:any",
  ADMIN_UPDATE_TIMESHEET_ANY = "admin:update:timesheet:any",
  ADMIN_DELETE_TIMESHEET_ANY = "admin:delete:timesheet:any",
  ADMIN_REPORT_TIMESHEET_ANY = "admin:report:timesheet:any",
  ADMIN_EXPORT_TIMESHEET_ANY = "admin:export:timesheet:any",

  // Invoice Permissions
  INVOICE_READ = "invoice:read",
  INVOICE_CREATE = "invoice:create",
  INVOICE_UPDATE = "invoice:update",
  INVOICE_DELETE = "invoice:delete",
  INVOICE_SEND = "invoice:send",
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
  USER = "USER",
}

export enum RoleHierarchy {
  SUPER_ADMIN = 4,
  ADMIN = 3,
  MANAGER = 2,
  EMPLOYEE = 1,
  USER = 0,
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
  [Role.MANAGER]: [
    Permission.MANAGER_CREATE_SHIFT_ANY,
    Permission.MANAGER_READ_SHIFT_ANY,
    Permission.MANAGER_UPDATE_SHIFT_ANY,
    Permission.MANAGER_APPROVE_SHIFT_ANY,
    Permission.MANAGER_READ_TIMESHEET_ANY,
    Permission.MANAGER_REPORT_TIMESHEET_ANY,
  ],
  [Role.EMPLOYEE]: [
    Permission.EMPLOYEE_CLOCK_SHIFT_OWN,
    Permission.EMPLOYEE_READ_SHIFT_OWN,
    Permission.EMPLOYEE_UPDATE_SHIFT_OWN,
    Permission.EMPLOYEE_READ_TIMESHEET_OWN,
  ],
  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SESSION_READ_OWN,
    Permission.SESSION_REVOKE_OWN,
    Permission.USER_LIST_LIMITED,
  ],
};
