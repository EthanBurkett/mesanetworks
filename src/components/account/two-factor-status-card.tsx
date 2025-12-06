"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, KeyRound } from "lucide-react";
import type { TwoFactorStatus } from "@/hooks/use-two-factor";

interface StatusCardProps {
  status: TwoFactorStatus | undefined;
}

export function TwoFactorStatusCard({ status }: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                status?.enabled ? "bg-green-500/10" : "bg-muted"
              }`}
            >
              <Shield
                className={`h-6 w-6 ${
                  status?.enabled ? "text-green-500" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>
                {status?.enabled
                  ? "Two-factor authentication is enabled"
                  : "Two-factor authentication is disabled"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status?.enabled ? "default" : "secondary"}>
            {status?.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      {status?.enabled && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            <span>
              {status.backupCodesCount} backup code
              {status.backupCodesCount !== 1 ? "s" : ""} remaining
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
