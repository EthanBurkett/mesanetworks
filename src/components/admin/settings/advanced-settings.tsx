"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, RefreshCw, Trash2 } from "lucide-react";
import { SettingToggle } from "../setting-toggle";
import {
  useSettings,
  useUpdateSettings,
  useCacheStats,
  useClearCache,
  useInitializeCache,
} from "@/lib/api/settings";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AdvancedSettings() {
  const { data: settings, isLoading } = useSettings();
  const { data: cacheStats } = useCacheStats();
  const updateSettings = useUpdateSettings();
  const clearCache = useClearCache();
  const initializeCache = useInitializeCache();

  // Local state for form inputs
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTTL, setCacheTTL] = useState(300);
  const [compression, setCompression] = useState(true);
  const [rateLimit, setRateLimit] = useState(100);
  const [maxRequestSize, setMaxRequestSize] = useState(10);
  const [apiLogging, setApiLogging] = useState(false);

  // Initialize cache service on mount
  useEffect(() => {
    initializeCache.mutate();
  }, []);

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setCacheEnabled(settings.cache.enabled);
      setCacheTTL(settings.cache.ttl);
      setCompression(settings.cache.compression);
      setRateLimit(settings.api.rateLimit);
      setMaxRequestSize(settings.api.maxRequestSize);
      setApiLogging(settings.api.logging);
    }
  }, [settings]);

  const handleCacheToggle = async (checked: boolean) => {
    setCacheEnabled(checked);
    try {
      await updateSettings.mutateAsync({
        cache: { enabled: checked },
      });
      toast.success(
        checked ? "Cache enabled successfully" : "Cache disabled successfully"
      );
    } catch (error) {
      toast.error("Failed to update cache settings");
      setCacheEnabled(!checked);
    }
  };

  const handleCompressionToggle = async (checked: boolean) => {
    setCompression(checked);
    try {
      await updateSettings.mutateAsync({
        cache: { compression: checked },
      });
      toast.success("Compression settings updated");
    } catch (error) {
      toast.error("Failed to update compression settings");
      setCompression(!checked);
    }
  };

  const handleApiLoggingToggle = async (checked: boolean) => {
    setApiLogging(checked);
    try {
      await updateSettings.mutateAsync({
        api: { logging: checked },
      });
      toast.success("API logging settings updated");
    } catch (error) {
      toast.error("Failed to update API logging settings");
      setApiLogging(!checked);
    }
  };

  const handleCacheTTLBlur = async () => {
    if (cacheTTL === settings?.cache.ttl) return;

    try {
      await updateSettings.mutateAsync({
        cache: { ttl: cacheTTL },
      });
      toast.success("Cache TTL updated successfully");
    } catch (error) {
      toast.error("Failed to update cache TTL");
      if (settings) setCacheTTL(settings.cache.ttl);
    }
  };

  const handleRateLimitBlur = async () => {
    if (rateLimit === settings?.api.rateLimit) return;

    try {
      await updateSettings.mutateAsync({
        api: { rateLimit },
      });
      toast.success("Rate limit updated successfully");
    } catch (error) {
      toast.error("Failed to update rate limit");
      if (settings) setRateLimit(settings.api.rateLimit);
    }
  };

  const handleMaxRequestSizeBlur = async () => {
    if (maxRequestSize === settings?.api.maxRequestSize) return;

    try {
      await updateSettings.mutateAsync({
        api: { maxRequestSize },
      });
      toast.success("Max request size updated successfully");
    } catch (error) {
      toast.error("Failed to update max request size");
      if (settings) setMaxRequestSize(settings.api.maxRequestSize);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache.mutateAsync();
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance & Caching
          </CardTitle>
          <CardDescription>
            Configure performance optimization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="enable-cache"
            label="Enable Caching"
            description="Cache API responses for better performance"
            checked={cacheEnabled}
            onCheckedChange={handleCacheToggle}
          />
          <div className="space-y-2">
            <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
            <Input
              id="cache-ttl"
              type="number"
              value={cacheTTL}
              onChange={(e) => setCacheTTL(Number(e.target.value))}
              onBlur={handleCacheTTLBlur}
              min={10}
              max={86400}
              disabled={!cacheEnabled}
            />
            <p className="text-xs text-muted-foreground">
              How long cached data should be kept (10 seconds to 24 hours)
            </p>
          </div>
          <Separator />
          <SettingToggle
            id="compression"
            label="Enable Compression"
            description="Compress API responses"
            checked={compression}
            onCheckedChange={handleCompressionToggle}
          />
          <Separator />
          {cacheStats && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Status</span>
                <Badge
                  variant={cacheStats.connected ? "default" : "destructive"}
                  className={
                    cacheStats.connected ? "bg-green-500" : "bg-red-500"
                  }
                >
                  {cacheStats.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cached Keys</p>
                  <p className="font-semibold">{cacheStats.keys}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory Usage</p>
                  <p className="font-semibold">{cacheStats.memory}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure API rate limits and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
              <Input
                id="rate-limit"
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                onBlur={handleRateLimitBlur}
                min={10}
                max={10000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-size">Max Request Size (MB)</Label>
              <Input
                id="request-size"
                type="number"
                value={maxRequestSize}
                onChange={(e) => setMaxRequestSize(Number(e.target.value))}
                onBlur={handleMaxRequestSizeBlur}
                min={1}
                max={100}
              />
            </div>
          </div>
          <SettingToggle
            id="api-logging"
            label="API Request Logging"
            description="Log all API requests for debugging"
            checked={apiLogging}
            onCheckedChange={handleApiLoggingToggle}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions - use with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleClearCache}
            disabled={!cacheEnabled || clearCache.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {clearCache.isPending ? "Clearing..." : "Clear All Cache"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
