"use server";

import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { env } from "@/config/env";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import os from "os";
import type { BackupResult, BackupListItem } from "./types";

const execAsync = promisify(exec);

/**
 * Get Azure Blob Storage container client
 */
function getContainerClient(): ContainerClient {
  const connectionString = env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = env.AZURE_BACKUP_CONTAINER_NAME;

  if (!connectionString) {
    throw new Error("Azure Storage connection string not configured");
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

/**
 * Create a database backup and upload to Azure Blob Storage
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupId = `backup-${timestamp}`;
  const tempDir = path.join(os.tmpdir(), backupId);

  try {
    // Ensure container exists
    const containerClient = getContainerClient();
    await containerClient.createIfNotExists();

    console.log(`Creating backup: ${backupId}`);

    // Create backup directory
    await fs.mkdir(tempDir, { recursive: true });

    // Run mongodump
    const mongoUri = env.DATABASE_URI;
    const dumpPath = path.join(tempDir, "dump");

    console.log(`Running mongodump to ${dumpPath}`);

    try {
      await execAsync(
        `mongodump --uri="${mongoUri}" --out="${dumpPath}" --gzip`,
        {
          maxBuffer: 1024 * 1024 * 100, // 100MB buffer
        }
      );
    } catch (error) {
      // Check if mongodump is installed
      throw new Error(
        "mongodump command failed. Ensure MongoDB Database Tools are installed."
      );
    }

    // Create a tar.gz archive of the dump
    const archivePath = path.join(tempDir, `${backupId}.tar.gz`);
    console.log(`Creating archive: ${archivePath}`);

    if (process.platform === "win32") {
      // Use PowerShell Compress-Archive on Windows
      await execAsync(
        `powershell Compress-Archive -Path "${dumpPath}" -DestinationPath "${archivePath.replace(
          ".tar.gz",
          ".zip"
        )}"`,
        {
          maxBuffer: 1024 * 1024 * 100,
        }
      );
    } else {
      // Use tar on Unix-like systems
      await execAsync(`tar -czf "${archivePath}" -C "${tempDir}" dump`, {
        maxBuffer: 1024 * 1024 * 100,
      });
    }

    const finalArchive =
      process.platform === "win32"
        ? archivePath.replace(".tar.gz", ".zip")
        : archivePath;

    // Get file size
    const stats = await fs.stat(finalArchive);
    const fileSize = stats.size;

    // Upload to Azure Blob Storage
    console.log(`Uploading to Azure: ${backupId}`);
    const blobName = `${backupId}${
      process.platform === "win32" ? ".zip" : ".tar.gz"
    }`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(finalArchive, {
      blobHTTPHeaders: {
        blobContentType: "application/gzip",
      },
      metadata: {
        timestamp: new Date().toISOString(),
        database: "mesanetworks",
      },
    });

    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    console.log(`Backup completed: ${backupId}`);

    return {
      success: true,
      message: `Backup created successfully: ${backupId}`,
      backupId,
      size: fileSize,
      blobUrl: blockBlobClient.url,
    };
  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}

    console.error("Backup failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Backup failed",
    };
  }
}

/**
 * List all available backups from Azure Blob Storage
 */
export async function listBackups(): Promise<BackupListItem[]> {
  try {
    const containerClient = getContainerClient();
    const backups: BackupListItem[] = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      backups.push({
        name: blob.name,
        createdAt: blob.properties.createdOn || new Date(),
        size: blob.properties.contentLength || 0,
        url: `${containerClient.url}/${blob.name}`,
      });
    }

    // Sort by creation date, newest first
    return backups.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error("Failed to list backups:", error);
    return [];
  }
}

/**
 * Delete a backup from Azure Blob Storage
 */
export async function deleteBackup(blobName: string): Promise<BackupResult> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.delete();

    return {
      success: true,
      message: `Backup deleted: ${blobName}`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete backup",
    };
  }
}

/**
 * Get the most recent backup info
 */
export async function getLatestBackupInfo(): Promise<BackupListItem | null> {
  const backups = await listBackups();
  return backups.length > 0 ? backups[0] : null;
}

/**
 * Download a backup from Azure Blob Storage
 */
export async function downloadBackup(blobName: string): Promise<string> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Generate a SAS URL with read permission for 1 hour
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 60 * 60 * 1000);

    // For simplicity, return the blob URL
    // In production, you'd generate a SAS token for secure downloads
    return blockBlobClient.url;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get download URL"
    );
  }
}
