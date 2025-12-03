import { ApiResponse } from "@/lib/api-utils";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";

const API_BASE = "/api/v1/audit-logs";

export interface AuditLogResponse {
  _id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  severity: AuditSeverity;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface AuditLogsListResponse {
  logs: AuditLogResponse[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface AuditStatsResponse {
  totalLogs: number;
  failedActions: number;
  criticalEvents: number;
  topActions: Array<{ _id: string; count: number }>;
  severityBreakdown: Array<{ _id: string; count: number }>;
}

export interface AuditLogsFilters {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  skip?: number;
}

export const auditLogsApi = {
  getAuditLogs: async (
    filters?: AuditLogsFilters
  ): Promise<AuditLogsListResponse> => {
    const params = new URLSearchParams();

    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.resourceType)
      params.append("resourceType", filters.resourceType);
    if (filters?.success !== undefined)
      params.append("success", String(filters.success));
    if (filters?.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters?.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.skip) params.append("skip", String(filters.skip));

    const res = await fetch(`${API_BASE}?${params.toString()}`, {
      credentials: "include",
    });

    const json: ApiResponse<AuditLogsListResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch audit logs");
    }

    return json.data;
  },

  getAuditStats: async (filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditStatsResponse> => {
    const params = new URLSearchParams();

    if (filters?.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters?.endDate)
      params.append("endDate", filters.endDate.toISOString());

    const res = await fetch(`${API_BASE}/stats?${params.toString()}`, {
      credentials: "include",
    });

    const json: ApiResponse<AuditStatsResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch audit stats");
    }

    return json.data;
  },
};
