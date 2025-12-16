// Audit log action types
export enum AuditAction {
  // Authentication
  USER_LOGIN = "user:login",
  USER_LOGOUT = "user:logout",
  USER_REGISTER = "user:register",
  LOGIN_FAILED = "user:login:failed",

  // User management
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_ACTIVATE = "user:activate",
  USER_DEACTIVATE = "user:deactivate",

  // Role management
  ROLE_CREATE = "role:create",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",
  ROLE_ASSIGN = "role:assign",
  ROLE_UNASSIGN = "role:unassign",

  // Session management
  SESSION_CREATE = "session:create",
  SESSION_REVOKE = "session:revoke",
  SESSION_REVOKE_ALL = "session:revoke:all",

  // System settings
  SETTINGS_UPDATE = "settings:update",

  // Permission changes
  PERMISSION_GRANT = "permission:grant",
  PERMISSION_REVOKE = "permission:revoke",

  // Security events
  SECURITY_PASSWORD_CHANGE = "security:password:change",
  SECURITY_PASSWORD_RESET = "security:password:reset",
  SECURITY_EMAIL_VERIFY = "security:email:verify",
  SECURITY_2FA_ENABLE = "security:2fa:enable",
  SECURITY_2FA_DISABLE = "security:2fa:disable",

  // Access control
  ACCESS_GRANTED = "access:granted",
  ACCESS_DENIED = "access:denied",

  // Invoice management
  INVOICE_CREATE = "invoice:create",
  INVOICE_UPDATE = "invoice:update",
  INVOICE_DELETE = "invoice:delete",
  INVOICE_SEND = "invoice:send",
  INVOICE_PAYMENT = "invoice:payment",
  INVOICE_MARK_PAID = "invoice:mark_paid",
  INVOICE_VOID = "invoice:void",
  INVOICE_REFUND = "invoice:refund",
}

// Severity levels
export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}
