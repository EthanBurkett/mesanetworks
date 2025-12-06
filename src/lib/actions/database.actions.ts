"use server";

import mongoose from "mongoose";
import { AuditLogModel } from "@/lib/db/models/AuditLog.model";
import {
  SettingsQueries,
  SettingsMutations,
} from "@/lib/db/models/Settings.model";
import type { DatabaseSettings } from "@/lib/db/models/Settings.model";
import { ensureDBConnection } from "../db";
import { reconnectDB } from "../db/odm";
import {
  createDatabaseBackup,
  getLatestBackupInfo,
  listBackups,
  deleteBackup as deleteAzureBackup,
} from "../backup/azure-backup";
import type { BackupListItem } from "../backup/types";

export interface DatabaseStats {
  connected: boolean;
  host: string;
  database: string;
  collections: number;
  totalSize: number; // in bytes
  indexes: number;
  connectionCount: number;
}

export interface BackupInfo {
  lastBackup: Date | null;
  nextScheduled: Date | null;
  backupSize: number;
}

/**
 * Get database connection stats
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    await ensureDBConnection();

    const connected = mongoose.connection.readyState === 1;
    const db = mongoose.connection.db;

    if (!db) {
      return {
        connected: false,
        host: "Unknown",
        database: "Unknown",
        collections: 0,
        totalSize: 0,
        indexes: 0,
        connectionCount: 0,
      };
    }

    const stats = await db.stats();
    const collections = await db.listCollections().toArray();

    // Count total indexes across all collections
    let totalIndexes = 0;
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      totalIndexes += indexes.length;
    }

    return {
      connected,
      host: mongoose.connection.host || "Unknown",
      database: mongoose.connection.name || "Unknown",
      collections: stats.collections || 0,
      totalSize: stats.dataSize || 0,
      indexes: totalIndexes,
      connectionCount: mongoose.connection.readyState === 1 ? 1 : 0,
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return {
      connected: false,
      host: "Error",
      database: "Error",
      collections: 0,
      totalSize: 0,
      indexes: 0,
      connectionCount: 0,
    };
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  latency: number; // in ms
  error?: string;
}> {
  const start = Date.now();

  try {
    await ensureDBConnection();

    // Ping the database
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    await db.admin().ping();
    const latency = Date.now() - start;

    return {
      success: true,
      latency,
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get database settings
 */
export async function getDatabaseSettings(): Promise<DatabaseSettings> {
  try {
    await ensureDBConnection();
    const settings = await SettingsQueries.getSettings();

    // Convert to plain object for server action serialization
    return {
      poolSize: settings.database.poolSize,
      connectionTimeout: settings.database.connectionTimeout,
      autoIndex: settings.database.autoIndex,
    };
  } catch (error) {
    console.error("Error getting database settings:", error);
    // Return default settings on error
    return {
      poolSize: 10,
      connectionTimeout: 5000,
      autoIndex: true,
    };
  }
}

/**
 * Update database settings
 */
export async function updateDatabaseSettings(
  updates: Partial<DatabaseSettings>
): Promise<DatabaseSettings> {
  try {
    await ensureDBConnection();
    const settings = await SettingsMutations.updateDatabaseSettings(updates);

    // If poolSize or connectionTimeout changed, reconnect with new settings
    if (
      updates.poolSize !== undefined ||
      updates.connectionTimeout !== undefined ||
      updates.autoIndex !== undefined
    ) {
      await reconnectDB();
    }

    // Convert to plain object for server action serialization
    return {
      poolSize: settings.database.poolSize,
      connectionTimeout: settings.database.connectionTimeout,
      autoIndex: settings.database.autoIndex,
    };
  } catch (error) {
    console.error("Error updating database settings:", error);
    throw error;
  }
}

/**
 * Optimize database by running compaction and rebuilding indexes
 */
export async function optimizeDatabase(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await ensureDBConnection();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not available");
    }

    const collections = await db.listCollections().toArray();

    // Reindex all collections
    for (const collection of collections) {
      await db.command({ reIndex: collection.name });
    }

    return {
      success: true,
      message: `Optimized ${collections.length} collections`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Optimization failed",
    };
  }
}

/**
 * Clear old audit logs (older than specified days)
 */
export async function clearOldAuditLogs(days: number = 90): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> {
  try {
    await ensureDBConnection();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLogModel.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    return {
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Deleted ${
        result.deletedCount || 0
      } audit logs older than ${days} days`,
    };
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      message:
        error instanceof Error ? error.message : "Failed to clear audit logs",
    };
  }
}

/**
 * Get backup information
 */
export async function getBackupInfo(): Promise<BackupInfo> {
  try {
    const latestBackup = await getLatestBackupInfo();

    if (!latestBackup) {
      return {
        lastBackup: null,
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        backupSize: 0,
      };
    }

    return {
      lastBackup: latestBackup.createdAt,
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      backupSize: latestBackup.size,
    };
  } catch (error) {
    console.error("Error getting backup info:", error);
    return {
      lastBackup: null,
      nextScheduled: null,
      backupSize: 0,
    };
  }
}

/**
 * Create a manual backup
 */
export async function createBackup(): Promise<{
  success: boolean;
  message: string;
  backupId?: string;
}> {
  try {
    const result = await createDatabaseBackup();
    return {
      success: result.success,
      message: result.message,
      backupId: result.backupId,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Backup failed",
    };
  }
}

/**
 * Get list of all backups
 */
export async function getAllBackups(): Promise<BackupListItem[]> {
  try {
    return await listBackups();
  } catch (error) {
    console.error("Error listing backups:", error);
    return [];
  }
}

/**
 * Delete a backup
 */
export async function deleteBackup(blobName: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const result = await deleteAzureBackup(blobName);
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete backup",
    };
  }
}
