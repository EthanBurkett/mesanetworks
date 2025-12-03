import { NextRequest } from "next/server";
import {
  AuditLogMutations,
  AuditAction,
  AuditSeverity,
} from "@/lib/db/models/AuditLog.model";
import type { AuthenticatedUser } from "./api-utils";

interface AuditLogData {
  action: AuditAction;
  description: string;
  severity?: AuditSeverity;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  success?: boolean;
  errorMessage?: string;
}

/**
 * Core audit logging function
 */
export async function createAuditLog(
  data: AuditLogData,
  context?: {
    auth?: AuthenticatedUser;
    request?: NextRequest;
  }
) {
  try {
    const ipAddress = context?.request
      ? context.request.headers.get("x-forwarded-for") ||
        context.request.headers.get("x-real-ip") ||
        undefined
      : undefined;

    const userAgent = context?.request
      ? context.request.headers.get("user-agent") || undefined
      : undefined;

    await AuditLogMutations.createLog({
      userId: context?.auth?.user?._id,
      userEmail: context?.auth?.user?.email,
      userName: context?.auth?.user
        ? `${context.auth.user.firstName} ${context.auth.user.lastName}`
        : undefined,
      action: data.action,
      severity: data.severity || AuditSeverity.INFO,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      description: data.description,
      metadata: data.metadata,
      ipAddress,
      userAgent,
      changes: data.changes,
      success: data.success !== undefined ? data.success : true,
      errorMessage: data.errorMessage,
    });
  } catch (error) {
    // Don't throw errors from audit logging - just log them
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Helper functions for common audit log scenarios
 */
export const AuditLogger = {
  // Authentication events
  async logLogin(
    email: string,
    success: boolean,
    context?: { request?: NextRequest; errorMessage?: string }
  ) {
    await createAuditLog(
      {
        action: success ? AuditAction.USER_LOGIN : AuditAction.LOGIN_FAILED,
        description: success
          ? `User ${email} logged in successfully`
          : `Failed login attempt for ${email}`,
        severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
        success,
        errorMessage: context?.errorMessage,
        metadata: { email },
      },
      { request: context?.request }
    );
  },

  async logLogout(auth: AuthenticatedUser, request?: NextRequest) {
    await createAuditLog(
      {
        action: AuditAction.USER_LOGOUT,
        description: `User ${auth.user.email} logged out`,
        severity: AuditSeverity.INFO,
      },
      { auth, request }
    );
  },

  async logRegister(email: string, userId: string, request?: NextRequest) {
    await createAuditLog(
      {
        action: AuditAction.USER_REGISTER,
        description: `New user registered: ${email}`,
        severity: AuditSeverity.INFO,
        resourceType: "User",
        resourceId: userId,
        resourceName: email,
        metadata: { email },
      },
      { request }
    );
  },

  // User management
  async logUserCreate(
    data: { email: string; createdBy: AuthenticatedUser },
    userId: string,
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.USER_CREATE,
        description: `Created user: ${data.email}`,
        severity: AuditSeverity.INFO,
        resourceType: "User",
        resourceId: userId,
        resourceName: data.email,
      },
      { auth: data.createdBy, request }
    );
  },

  async logUserUpdate(
    data: {
      userId: string;
      userEmail: string;
      updatedBy: AuthenticatedUser;
      changes?: { before?: any; after?: any };
    },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.USER_UPDATE,
        description: `Updated user: ${data.userEmail}`,
        severity: AuditSeverity.INFO,
        resourceType: "User",
        resourceId: data.userId,
        resourceName: data.userEmail,
        changes: data.changes,
      },
      { auth: data.updatedBy, request }
    );
  },

  async logUserDelete(
    data: { userId: string; userEmail: string; deletedBy: AuthenticatedUser },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.USER_DELETE,
        description: `Deleted user: ${data.userEmail}`,
        severity: AuditSeverity.WARNING,
        resourceType: "User",
        resourceId: data.userId,
        resourceName: data.userEmail,
      },
      { auth: data.deletedBy, request }
    );
  },

  // Role management
  async logRoleCreate(
    data: { roleName: string; createdBy: AuthenticatedUser },
    roleId: string,
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.ROLE_CREATE,
        description: `Created role: ${data.roleName}`,
        severity: AuditSeverity.INFO,
        resourceType: "Role",
        resourceId: roleId,
        resourceName: data.roleName,
      },
      { auth: data.createdBy, request }
    );
  },

  async logRoleUpdate(
    data: {
      roleId: string;
      roleName: string;
      updatedBy: AuthenticatedUser;
      changes?: { before?: any; after?: any };
    },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.ROLE_UPDATE,
        description: `Updated role: ${data.roleName}`,
        severity: AuditSeverity.INFO,
        resourceType: "Role",
        resourceId: data.roleId,
        resourceName: data.roleName,
        changes: data.changes,
      },
      { auth: data.updatedBy, request }
    );
  },

  async logRoleAssign(
    data: {
      userId: string;
      userEmail: string;
      roleId: string;
      roleName: string;
      assignedBy: AuthenticatedUser;
    },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.ROLE_ASSIGN,
        description: `Assigned role "${data.roleName}" to user ${data.userEmail}`,
        severity: AuditSeverity.INFO,
        resourceType: "User",
        resourceId: data.userId,
        resourceName: data.userEmail,
        metadata: {
          roleId: data.roleId,
          roleName: data.roleName,
        },
      },
      { auth: data.assignedBy, request }
    );
  },

  // Session management
  async logSessionRevoke(
    data: { sessionId: string; revokedBy: AuthenticatedUser },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.SESSION_REVOKE,
        description: `Revoked session`,
        severity: AuditSeverity.INFO,
        resourceType: "Session",
        resourceId: data.sessionId,
      },
      { auth: data.revokedBy, request }
    );
  },

  // Access control
  async logAccessDenied(
    data: {
      resource: string;
      requiredPermission: string;
      auth?: AuthenticatedUser;
    },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.ACCESS_DENIED,
        description: `Access denied to ${data.resource} (required: ${data.requiredPermission})`,
        severity: AuditSeverity.WARNING,
        success: false,
        metadata: {
          resource: data.resource,
          requiredPermission: data.requiredPermission,
        },
      },
      { auth: data.auth, request }
    );
  },

  // Security events
  async logPasswordChange(
    data: { userId: string; userEmail: string },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.SECURITY_PASSWORD_CHANGE,
        description: `Password changed for ${data.userEmail}`,
        severity: AuditSeverity.INFO,
        resourceType: "User",
        resourceId: data.userId,
        resourceName: data.userEmail,
      },
      { request }
    );
  },

  async logPasswordReset(
    data: { email: string; userId?: string },
    request?: NextRequest
  ) {
    await createAuditLog(
      {
        action: AuditAction.SECURITY_PASSWORD_RESET,
        description: `Password reset for ${data.email}`,
        severity: AuditSeverity.WARNING,
        resourceType: "User",
        resourceId: data.userId,
        resourceName: data.email,
      },
      { request }
    );
  },
};
