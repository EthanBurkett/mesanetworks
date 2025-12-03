"use client";

import { useAuditLogs, useAuditStats } from "@/hooks/use-audit-logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import {
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Calendar,
  Search,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const severityConfig = {
  [AuditSeverity.INFO]: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Info,
  },
  [AuditSeverity.WARNING]: {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: AlertTriangle,
  },
  [AuditSeverity.ERROR]: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  [AuditSeverity.CRITICAL]: {
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: Shield,
  },
};

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    action: undefined as AuditAction | undefined,
    severity: undefined as AuditSeverity | undefined,
    success: undefined as boolean | undefined,
    limit: 50,
    skip: 0,
  });

  const { data, isLoading, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditStats();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      skip: 0, // Reset pagination when filters change
    }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      skip: (prev.skip || 0) + (prev.limit || 50),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track system events and user actions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.failedActions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {stats.criticalEvents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.totalLogs > 0
                  ? (
                      ((stats.totalLogs - stats.failedActions) /
                        stats.totalLogs) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={filters.severity || "all"}
                onValueChange={(value) => handleFilterChange("severity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value={AuditSeverity.INFO}>Info</SelectItem>
                  <SelectItem value={AuditSeverity.WARNING}>Warning</SelectItem>
                  <SelectItem value={AuditSeverity.ERROR}>Error</SelectItem>
                  <SelectItem value={AuditSeverity.CRITICAL}>
                    Critical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={
                  filters.success === undefined
                    ? "all"
                    : filters.success
                    ? "success"
                    : "failed"
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "success",
                    value === "all" ? undefined : value === "success"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Limit</label>
              <Select
                value={String(filters.limit)}
                onValueChange={(value) =>
                  handleFilterChange("limit", Number.parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 events</SelectItem>
                  <SelectItem value="50">50 events</SelectItem>
                  <SelectItem value="100">100 events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data && data.logs.length > 0 ? (
            <div className="space-y-2">
              {data.logs.map((log, index) => {
                const SeverityIcon = severityConfig[log.severity].icon;
                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Collapsible>
                      <div className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-lg border ${
                              severityConfig[log.severity].color
                            }`}
                          >
                            <SeverityIcon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {log.description}
                              </span>
                              {log.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                              {log.userName && (
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {log.userName}
                                </span>
                              )}
                              {log.userEmail && !log.userName && (
                                <span>{log.userEmail}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(log.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                            </div>

                            {(log.metadata ||
                              log.changes ||
                              log.ipAddress ||
                              log.errorMessage) && (
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-6 text-xs gap-1"
                                >
                                  Details
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </CollapsibleTrigger>
                            )}

                            <CollapsibleContent className="mt-3 space-y-2">
                              {log.errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm text-red-500">
                                  <strong>Error:</strong> {log.errorMessage}
                                </div>
                              )}

                              {log.ipAddress && (
                                <div className="text-sm">
                                  <strong>IP Address:</strong> {log.ipAddress}
                                </div>
                              )}

                              {log.changes && (
                                <div className="bg-muted rounded p-3 text-sm">
                                  <strong className="block mb-2">
                                    Changes:
                                  </strong>
                                  <pre className="overflow-x-auto text-xs">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.metadata && (
                                <div className="bg-muted rounded p-3 text-sm">
                                  <strong className="block mb-2">
                                    Metadata:
                                  </strong>
                                  <pre className="overflow-x-auto text-xs">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </CollapsibleContent>
                          </div>
                        </div>
                      </div>
                    </Collapsible>
                  </motion.div>
                );
              })}

              {data.hasMore && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleLoadMore}
                >
                  Load More
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
