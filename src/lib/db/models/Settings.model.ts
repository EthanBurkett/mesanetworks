import { field, getModel, model } from "../odm";

export interface CacheSettings {
  enabled: boolean;
  ttl: number; // in seconds
  redisUrl?: string;
  compression: boolean;
}

export interface ApiSettings {
  rateLimit: number; // requests per minute
  maxRequestSize: number; // in MB
  logging: boolean;
}

@model("Settings", { timestamps: true })
export class Settings {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Cache settings
  @field({ type: Object, required: true })
  cache!: CacheSettings;

  // API settings
  @field({ type: Object, required: true })
  api!: ApiSettings;
}

export const SettingsModel = getModel(Settings);

export class SettingsQueries {
  static async getSettings() {
    // Always return the first (and only) settings document
    let settings = await SettingsModel.findOne().exec();

    // Create default settings if none exist
    if (!settings) {
      settings = await SettingsModel.create({
        cache: {
          enabled: true,
          ttl: 300,
          compression: true,
        },
        api: {
          rateLimit: 100,
          maxRequestSize: 10,
          logging: false,
        },
      });
    }

    return settings;
  }
}

export class SettingsMutations {
  static async updateCacheSettings(updates: Partial<CacheSettings>) {
    let settings = await SettingsModel.findOne().exec();

    if (!settings) {
      settings = await SettingsModel.create({
        cache: {
          enabled: updates.enabled ?? true,
          ttl: updates.ttl ?? 300,
          redisUrl: updates.redisUrl,
          compression: updates.compression ?? true,
        },
        api: {
          rateLimit: 100,
          maxRequestSize: 10,
          logging: false,
        },
      });
    } else {
      settings.cache = { ...settings.cache, ...updates };
      await settings.save();
    }

    return settings;
  }

  static async updateApiSettings(updates: Partial<ApiSettings>) {
    let settings = await SettingsModel.findOne().exec();

    if (!settings) {
      settings = await SettingsModel.create({
        cache: {
          enabled: true,
          ttl: 300,
          compression: true,
        },
        api: {
          rateLimit: updates.rateLimit ?? 100,
          maxRequestSize: updates.maxRequestSize ?? 10,
          logging: updates.logging ?? false,
        },
      });
    } else {
      settings.api = { ...settings.api, ...updates };
      await settings.save();
    }

    return settings;
  }

  static async updateSettings(
    cacheUpdates?: Partial<CacheSettings>,
    apiUpdates?: Partial<ApiSettings>
  ) {
    let settings = await SettingsModel.findOne().exec();

    if (!settings) {
      settings = await SettingsModel.create({
        cache: {
          enabled: cacheUpdates?.enabled ?? true,
          ttl: cacheUpdates?.ttl ?? 300,
          redisUrl: cacheUpdates?.redisUrl,
          compression: cacheUpdates?.compression ?? true,
        },
        api: {
          rateLimit: apiUpdates?.rateLimit ?? 100,
          maxRequestSize: apiUpdates?.maxRequestSize ?? 10,
          logging: apiUpdates?.logging ?? false,
        },
      });
    } else {
      if (cacheUpdates) {
        settings.cache = { ...settings.cache, ...cacheUpdates };
      }
      if (apiUpdates) {
        settings.api = { ...settings.api, ...apiUpdates };
      }
      await settings.save();
    }

    return settings;
  }
}
