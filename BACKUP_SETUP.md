# Database Backup Configuration

Automated daily backups to Azure Blob Storage using `mongodump`.

## Prerequisites

1. **MongoDB Database Tools** installed

   - Windows: Download from [MongoDB Downloads](https://www.mongodb.com/try/download/database-tools)
   - macOS: `brew install mongodb-database-tools`
   - Linux: `sudo apt-get install mongodb-database-tools`

2. **Azure Blob Storage** account and container created

## Environment Variables

Add these to your `.env.local`:

```bash
# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<your-account>;AccountKey=<your-key>;EndpointSuffix=core.windows.net"
AZURE_BACKUP_CONTAINER_NAME="database-backups"

# Alternative: Use account name and key separately
# AZURE_STORAGE_ACCOUNT_NAME="your-storage-account"
# AZURE_STORAGE_ACCOUNT_KEY="your-access-key"
```

### Getting Azure Connection String

1. Go to Azure Portal → Storage Accounts
2. Select your storage account
3. Under "Security + networking" → "Access keys"
4. Copy the "Connection string" from Key1 or Key2

## Manual Backup

Run a backup manually:

```bash
pnpm backup
```

This will:

1. Create a compressed MongoDB dump
2. Upload to Azure Blob Storage
3. Clean up local temporary files

## Automated Daily Backups

### Option 1: Local Scheduler (Development)

Run the daily scheduler:

```bash
pnpm backup:daily
```

This starts a process that runs backups daily at 3 AM.

### Option 2: System Cron (Linux/macOS)

Add to crontab:

```bash
# Run backup daily at 3 AM
0 3 * * * cd /path/to/mesanetworks && pnpm backup >> /var/log/backup.log 2>&1
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 3:00 AM
4. Action: Start a program
   - Program: `pnpm`
   - Arguments: `backup`
   - Start in: `C:\path\to\mesanetworks`

### Option 4: Azure Functions (Recommended for Production)

Create a Timer-triggered Azure Function:

```typescript
import { app, InvocationContext, Timer } from "@azure/functions";
import { runScheduledBackup } from "./backup-scheduler";

export async function timerTrigger(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  await runScheduledBackup();
}

app.timer("dailyBackup", {
  schedule: "0 0 3 * * *", // 3 AM daily
  handler: timerTrigger,
});
```

### Option 5: GitHub Actions

Create `.github/workflows/backup.yml`:

```yaml
name: Daily Database Backup

on:
  schedule:
    - cron: "0 3 * * *" # 3 AM UTC daily
  workflow_dispatch: # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Install MongoDB Tools
        run: |
          wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
          echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
          sudo apt-get update
          sudo apt-get install -y mongodb-database-tools

      - name: Run Backup
        env:
          DATABASE_URI: ${{ secrets.DATABASE_URI }}
          AZURE_STORAGE_CONNECTION_STRING: ${{ secrets.AZURE_STORAGE_CONNECTION_STRING }}
          AZURE_BACKUP_CONTAINER_NAME: database-backups
        run: pnpm backup
```

## Backup Retention

Backups are automatically deleted after 30 days. To change this, edit `BACKUP_RETENTION_DAYS` in `src/lib/backup/backup-scheduler.ts`.

## Restore from Backup

1. Download backup from Azure Portal or use the UI
2. Extract the archive:
   ```bash
   tar -xzf backup-2025-12-03.tar.gz
   ```
3. Restore with mongorestore:
   ```bash
   mongorestore --uri="your-mongodb-uri" --drop ./dump
   ```

## Monitoring

- Backups are logged to console
- Failed backups should trigger alerts (implement in `backup-scheduler.ts`)
- Check Azure Blob Storage for backup files

## Storage Costs

Typical backup sizes:

- Small database (<100MB): ~$0.01/month
- Medium database (1GB): ~$0.20/month
- Large database (10GB): ~$2.00/month

Azure Blob Storage pricing: ~$0.018/GB/month (cool tier)

## Troubleshooting

### "mongodump command not found"

Install MongoDB Database Tools (see Prerequisites).

### "Azure Storage connection string not configured"

Add `AZURE_STORAGE_CONNECTION_STRING` to `.env.local`.

### Backup fails with permission error

Ensure the Azure Storage account key has write permissions.

### Large databases timeout

Increase `maxBuffer` in `azure-backup.ts`:

```typescript
maxBuffer: 1024 * 1024 * 500, // 500MB
```
