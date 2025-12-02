"use client";

import { useSessions, useRevokeSession } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  Shield,
  Trash2,
  Loader2,
  Chrome,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";

export default function SecurityPage() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getBrowserIcon = (browser?: string) => {
    if (browser?.toLowerCase().includes("chrome")) return Chrome;
    return Globe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Sessions & Security</h1>
        <p className="text-muted-foreground">
          Manage your active sessions and security settings
        </p>
      </div>

      {/* Active Sessions */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Active Sessions</h2>
          </div>
          <Badge variant="outline">
            {sessions?.length || 0}{" "}
            {sessions?.length === 1 ? "Session" : "Sessions"}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.deviceType);
              const BrowserIcon = getBrowserIcon(session.browser);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Device Icon */}
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <DeviceIcon className="h-6 w-6 text-accent" />
                      </div>

                      {/* Session Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">
                            {session.deviceName ||
                              session.deviceType ||
                              "Unknown Device"}
                          </h3>
                          {session.isCurrent && (
                            <Badge
                              variant="default"
                              className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            >
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {session.browser && (
                            <div className="flex items-center gap-1.5">
                              <BrowserIcon className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {session.browser}
                                {session.os && ` on ${session.os}`}
                              </span>
                            </div>
                          )}

                          {session.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {[
                                  session.location.city,
                                  session.location.region,
                                  session.location.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "Unknown Location"}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Last active{" "}
                              {formatDistanceToNow(
                                new Date(session.lastActiveAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Globe className="h-3.5 w-3.5" />
                            <span>{session.ipAddress}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          Started{" "}
                          {formatDistanceToNow(new Date(session.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSessionMutation.mutate(session.id)}
                        disabled={revokeSessionMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions found</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Security Tips</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              Sign out of devices you don't recognize to protect your account
            </p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>Regularly review your active sessions for suspicious activity</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
            <p>
              Use a strong, unique password and enable two-factor authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
