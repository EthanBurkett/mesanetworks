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

export interface DatabaseSettings {
  poolSize: number;
  connectionTimeout: number; // in ms
  autoIndex: boolean;
}

export interface EmailSettings {
  smtpHost?: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName: string;
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

  // Database settings
  @field({ type: Object, required: true })
  database!: DatabaseSettings;

  // Email settings
  @field({ type: Object, required: true })
  email!: EmailSettings;
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
        database: {
          poolSize: 10,
          connectionTimeout: 5000,
          autoIndex: true,
        },
        email: {
          smtpPort: 587,
          smtpSecure: false,
          fromName: "Mesa Networks",
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
        database: {
          poolSize: 10,
          connectionTimeout: 5000,
          autoIndex: true,
        },
        email: {
          smtpPort: 587,
          smtpSecure: false,
          fromName: "Mesa Networks",
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
        database: {
          poolSize: 10,
          connectionTimeout: 5000,
          autoIndex: true,
        },
        email: {
          smtpPort: 587,
          smtpSecure: false,
          fromName: "Mesa Networks",
        },
      });
    } else {
      settings.api = { ...settings.api, ...updates };
      await settings.save();
    }

    return settings;
  }

  static async updateDatabaseSettings(updates: Partial<DatabaseSettings>) {
    let settings = await SettingsModel.findOne().exec();

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
        database: {
          poolSize: updates.poolSize ?? 10,
          connectionTimeout: updates.connectionTimeout ?? 5000,
          autoIndex: updates.autoIndex ?? true,
        },
        email: {
          smtpPort: 587,
          smtpSecure: false,
          fromName: "Mesa Networks",
        },
      });
    } else {
      settings.database = { ...settings.database, ...updates };
      await settings.save();
    }

    return settings;
  }

  static async updateSettings(
    cacheUpdates?: Partial<CacheSettings>,
    apiUpdates?: Partial<ApiSettings>,
    databaseUpdates?: Partial<DatabaseSettings>,
    emailUpdates?: Partial<EmailSettings>
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
        database: {
          poolSize: databaseUpdates?.poolSize ?? 10,
          connectionTimeout: databaseUpdates?.connectionTimeout ?? 5000,
          autoIndex: databaseUpdates?.autoIndex ?? true,
        },
        email: {
          smtpHost: emailUpdates?.smtpHost,
          smtpPort: emailUpdates?.smtpPort ?? 587,
          smtpSecure: emailUpdates?.smtpSecure ?? false,
          smtpUser: emailUpdates?.smtpUser,
          smtpPassword: emailUpdates?.smtpPassword,
          fromEmail: emailUpdates?.fromEmail,
          fromName: emailUpdates?.fromName ?? "Mesa Networks",
        },
      });
    } else {
      if (cacheUpdates) {
        settings.cache = { ...settings.cache, ...cacheUpdates };
      }
      if (apiUpdates) {
        settings.api = { ...settings.api, ...apiUpdates };
      }
      if (databaseUpdates) {
        settings.database = { ...settings.database, ...databaseUpdates };
      }
      if (emailUpdates) {
        settings.email = { ...settings.email, ...emailUpdates };
      }
      await settings.save();
    }

    return settings;
  }

  static async updateEmailSettings(updates: Partial<EmailSettings>) {
    let settings = await SettingsModel.findOne().exec();

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
        database: {
          poolSize: 10,
          connectionTimeout: 5000,
          autoIndex: true,
        },
        email: {
          smtpHost: updates.smtpHost,
          smtpPort: updates.smtpPort ?? 587,
          smtpSecure: updates.smtpSecure ?? false,
          smtpUser: updates.smtpUser,
          smtpPassword: updates.smtpPassword,
          fromEmail: updates.fromEmail,
          fromName: updates.fromName ?? "Mesa Networks",
        },
      });
    } else {
      settings.email = { ...settings.email, ...updates };
      await settings.save();
    }

    return settings;
  }
}
