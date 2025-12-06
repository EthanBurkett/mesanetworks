"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Database,
  RefreshCw,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
import { SettingToggle } from "../setting-toggle";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getDatabaseStats,
  getDatabaseSettings,
  updateDatabaseSettings,
  testDatabaseConnection,
  optimizeDatabase,
  clearOldAuditLogs,
  getBackupInfo,
  createBackup,
  getAllBackups,
  deleteBackup,
  type DatabaseStats,
  type BackupInfo,
} from "@/lib/actions/database.actions";
import type { BackupListItem } from "@/lib/backup/types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
import type { DatabaseSettings as DatabaseSettingsType } from "@/lib/db/models/Settings.model";

export function DatabaseSettings() {
  const [isPending, startTransition] = useTransition();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [settings, setSettings] = useState<DatabaseSettingsType | null>(null);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [backupList, setBackupList] = useState<BackupListItem[]>([]);
  const [connectionLatency, setConnectionLatency] = useState<number | null>(
    null
  );

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, settingsData, backupData, backups] = await Promise.all([
        getDatabaseStats(),
        getDatabaseSettings(),
        getBackupInfo(),
        getAllBackups(),
      ]);
      setStats(statsData);
      setSettings(settingsData);
      setBackupInfo(backupData);
      setBackupList(backups);
    } catch (error) {
      toast.error("Failed to load database information");
      // Set fallback data to prevent infinite loading
      setStats({
        connected: false,
        host: "Error",
        database: "Error",
        collections: 0,
        totalSize: 0,
        indexes: 0,
        connectionCount: 0,
      });
      setSettings({
        poolSize: 10,
        connectionTimeout: 5000,
        autoIndex: true,
      });
      setBackupInfo({
        lastBackup: null,
        nextScheduled: null,
        backupSize: 0,
      });
      setBackupList([]);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testDatabaseConnection();
      setConnectionLatency(result.latency);

      if (result.success) {
        toast.success(`Connection Successful - Latency: ${result.latency}ms`);
      } else {
        toast.error(result.error || "Connection failed - Unknown error");
      }
    } catch (error) {
      toast.error("Failed to test connection");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleUpdateSettings = async (
    updates: Partial<DatabaseSettingsType>
  ) => {
    startTransition(async () => {
      try {
        const updated = await updateDatabaseSettings(updates);
        setSettings(updated);
        toast.success("Database settings have been saved");
      } catch (error) {
        toast.error("Failed to update settings");
      }
    });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizeDatabase();
      if (result.success) {
        toast.success(result.message);
        await loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to optimize database");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const result = await clearOldAuditLogs(90);
      if (result.success) {
        toast.success(result.message);
        await loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to clear audit logs");
    } finally {
      setIsClearing(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await createBackup();
      if (result.success) {
        toast.success(result.message);
        await loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create backup");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDeleteBackup = async (blobName: string) => {
    try {
      const result = await deleteBackup(blobName);
      if (result.success) {
        toast.success(result.message);
        await loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete backup");
    }
  };

  if (!stats || !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Manage database connection and optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Connection Status</p>
                  <Badge
                    variant={stats.connected ? "default" : "destructive"}
                    className={stats.connected ? "bg-green-500" : ""}
                  >
                    {stats.connected ? "Connected" : "Disconnected"}
                  </Badge>
                  {connectionLatency !== null && (
                    <span className="text-sm text-muted-foreground">
                      {connectionLatency}ms
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.host} • {stats.database}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{stats.collections} collections</span>
                  <span>{formatBytes(stats.totalSize)}</span>
                  <span>{stats.indexes} indexes</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pool-size">Connection Pool Size</Label>
              <Input
                id="pool-size"
                type="number"
                value={settings.poolSize || 10}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    poolSize: parseInt(e.target.value) || 10,
                  })
                }
                onBlur={(e) =>
                  handleUpdateSettings({
                    poolSize: parseInt(e.target.value) || 10,
                  })
                }
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Connection Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={settings.connectionTimeout || 5000}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    connectionTimeout: parseInt(e.target.value) || 5000,
                  })
                }
                onBlur={(e) =>
                  handleUpdateSettings({
                    connectionTimeout: parseInt(e.target.value) || 5000,
                  })
                }
                disabled={isPending}
              />
            </div>
          </div>
          <SettingToggle
            id="auto-index"
            label="Auto-create Indexes"
            description="Automatically create database indexes"
            checked={settings.autoIndex}
            onCheckedChange={(checked) =>
              handleUpdateSettings({ autoIndex: checked })
            }
            disabled={isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Maintenance</CardTitle>
          <CardDescription>Backup and optimization tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Last Backup</p>
              <p className="text-sm text-muted-foreground">
                {backupInfo?.lastBackup
                  ? new Date(backupInfo.lastBackup).toLocaleString()
                  : "Never"}
              </p>
              {backupInfo?.backupSize && (
                <p className="text-xs text-muted-foreground">
                  Size: {formatBytes(backupInfo.backupSize)}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Create Backup
            </Button>
          </div>
          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimize}
              disabled={isOptimizing}
            >
              {isOptimizing && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Optimize Database
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={isClearing}
            >
              {isClearing && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Clear Audit Logs (90+ days)
            </Button>
          </div>

          {backupList.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Backup History</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backupList.map((backup) => (
                    <div
                      key={backup.name}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {backup.name}
                        </p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>
                            {new Date(backup.createdAt).toLocaleString()}
                          </span>
                          <span>{formatBytes(backup.size)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(backup.url, "_blank")}
                          title="Download backup"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.name)}
                          title="Delete backup"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Backups are stored in Azure Blob Storage. Automatic daily backups
              at 3 AM with 30-day retention. See BACKUP_SETUP.md for
              configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
