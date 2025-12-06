export interface BackupResult {
  success: boolean;
  message: string;
  backupId?: string;
  size?: number;
  blobUrl?: string;
}

export interface BackupListItem {
  name: string;
  createdAt: Date;
  size: number;
  url: string;
}
