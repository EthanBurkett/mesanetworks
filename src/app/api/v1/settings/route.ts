import { NextRequest } from "next/server";
import { wrapper } from "@/lib/api-utils";
import { z } from "zod";
import {
  SettingsQueries,
  SettingsMutations,
} from "@/lib/db/models/Settings.model";
import { Permission } from "@/lib/rbac";

const updateCacheSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  ttl: z.number().min(10).max(86400).optional(), // 10 seconds to 24 hours
  redisUrl: z.string().optional(),
  compression: z.boolean().optional(),
});

const updateApiSettingsSchema = z.object({
  rateLimit: z.number().min(10).max(10000).optional(),
  maxRequestSize: z.number().min(1).max(100).optional(),
  logging: z.boolean().optional(),
});

const updateSettingsSchema = z.object({
  cache: updateCacheSettingsSchema.optional(),
  api: updateApiSettingsSchema.optional(),
});

// GET /api/v1/settings - Get all settings
export async function GET(request: NextRequest) {
  return wrapper(
    {
      request,
      requirePermission: Permission.SETTINGS_READ,
    },
    async () => {
      const settings = await SettingsQueries.getSettings();
      return settings;
    }
  );
}

// PATCH /api/v1/settings - Update settings
export async function PATCH(request: NextRequest) {
  return wrapper(
    {
      request,
      parser: updateSettingsSchema,
      requirePermission: Permission.SETTINGS_WRITE,
    },
    async ({ body }) => {
      const settings = await SettingsMutations.updateSettings(
        body.cache,
        body.api
      );
      return settings;
    }
  );
}
