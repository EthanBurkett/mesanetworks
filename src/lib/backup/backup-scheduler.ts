/**
 * Database Backup Scheduler
 *
 * This module provides scheduled database backups to Azure Blob Storage.
 * Run this as a separate Node.js process or integrate with your deployment platform's cron system.
 *
 * Usage:
 * 1. Local development: node -r ts-node/register src/lib/backup/backup-scheduler.ts
 * 2. Production: Add to package.json scripts or use a cron service
 * 3. Azure: Use Azure Functions with Timer Trigger
 * 4. Vercel: Use Vercel Cron Jobs
 */

import {
  createDatabaseBackup,
  listBackups,
  deleteBackup,
} from "./azure-backup";

const BACKUP_RETENTION_DAYS = 30; // Keep backups for 30 days

/**
 * Run a scheduled backup
 */
async function runScheduledBackup() {
  console.log(`[${new Date().toISOString()}] Starting scheduled backup...`);

  try {
    // Create backup
    const result = await createDatabaseBackup();

    if (result.success) {
      console.log(`✅ Backup created: ${result.backupId}`);
      console.log(`   Size: ${(result.size! / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   URL: ${result.blobUrl}`);

      // Clean up old backups
      await cleanupOldBackups();
    } else {
      console.error(`❌ Backup failed: ${result.message}`);
      // Send alert (email, Slack, etc.)
      // await sendBackupFailureAlert(result.message);
    }
  } catch (error) {
    console.error("❌ Backup error:", error);
    // Send alert
    // await sendBackupFailureAlert(error);
  }

  console.log(`[${new Date().toISOString()}] Backup process completed\n`);
}

/**
 * Delete backups older than retention period
 */
async function cleanupOldBackups() {
  try {
    const backups = await listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);

    const oldBackups = backups.filter(
      (backup) => backup.createdAt < cutoffDate
    );

    if (oldBackups.length === 0) {
      console.log("No old backups to clean up");
      return;
    }

    console.log(`Cleaning up ${oldBackups.length} old backups...`);

    for (const backup of oldBackups) {
      console.log(
        `Deleting: ${backup.name} (${backup.createdAt.toISOString()})`
      );
      await deleteBackup(backup.name);
    }

    console.log(`✅ Cleaned up ${oldBackups.length} old backups`);
  } catch (error) {
    console.error("Failed to clean up old backups:", error);
  }
}

/**
 * Main function - run backup immediately or on schedule
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "once";

  if (mode === "once") {
    // Run backup once and exit
    await runScheduledBackup();
    process.exit(0);
  } else if (mode === "daily") {
    // Run backup daily at 3 AM
    console.log("Starting daily backup scheduler (3 AM)...");

    const scheduleNextBackup = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(3, 0, 0, 0);

      // If 3 AM has passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      const delay = next.getTime() - now.getTime();
      console.log(`Next backup scheduled for: ${next.toISOString()}`);

      setTimeout(async () => {
        await runScheduledBackup();
        scheduleNextBackup(); // Schedule next day
      }, delay);
    };

    scheduleNextBackup();

    // Keep process alive
    process.on("SIGINT", () => {
      console.log("Shutting down backup scheduler...");
      process.exit(0);
    });
  } else {
    console.log("Usage:");
    console.log("  npm run backup          - Run backup once");
    console.log("  npm run backup:daily    - Run daily at 3 AM");
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runScheduledBackup, cleanupOldBackups };
