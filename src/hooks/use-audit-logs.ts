import { useQuery } from "@tanstack/react-query";
import { auditLogsApi, type AuditLogsFilters } from "@/lib/api/audit-logs";

export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditLogsApi.getAuditLogs(filters),
  });
}

export function useAuditStats(filters?: { startDate?: Date; endDate?: Date }) {
  return useQuery({
    queryKey: ["audit-stats", filters],
    queryFn: () => auditLogsApi.getAuditStats(filters),
  });
}
