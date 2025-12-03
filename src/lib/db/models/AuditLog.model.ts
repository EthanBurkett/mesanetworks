import { field, getModel, model, index, compoundIndex } from "../odm";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";

// Re-export for backwards compatibility
export { AuditAction, AuditSeverity };

@model("AuditLog", { timestamps: true })
@compoundIndex({ createdAt: -1 })
@compoundIndex({ userId: 1, createdAt: -1 })
@compoundIndex({ action: 1, createdAt: -1 })
@compoundIndex({ resourceType: 1, resourceId: 1 })
export class AuditLog {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Who performed the action
  @field({ type: String, ref: "User" })
  userId?: string;

  @field({ type: String })
  userEmail?: string;

  @field({ type: String })
  userName?: string;

  // What action was performed
  @field({ type: String, required: true, enum: Object.values(AuditAction) })
  action!: AuditAction;

  @field({
    type: String,
    required: true,
    enum: Object.values(AuditSeverity),
    default: AuditSeverity.INFO,
  })
  severity!: AuditSeverity;

  // What resource was affected
  @field({ type: String })
  resourceType?: string;

  @field({ type: String })
  resourceId?: string;

  @field({ type: String })
  resourceName?: string;

  // Additional context
  @field({ type: String, required: true })
  description!: string;

  @field({ type: Object })
  metadata?: Record<string, any>;

  // Request context
  @field({ type: String })
  ipAddress?: string;

  @field({ type: String })
  userAgent?: string;

  // Changes made (for update actions)
  @field({ type: Object })
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  // Result
  @field({ type: Boolean, default: true })
  success!: boolean;

  @field({ type: String })
  errorMessage?: string;
}

export const AuditLogModel = getModel(AuditLog);

export class AuditLogQueries {
  static async findById(id: string) {
    return AuditLogModel.findById(id).exec();
  }

  static async findByUserId(
    userId: string,
    options?: { limit?: number; skip?: number }
  ) {
    return AuditLogModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(options?.limit || 100)
      .skip(options?.skip || 0)
      .exec();
  }

  static async findByAction(
    action: AuditAction,
    options?: { limit?: number; skip?: number }
  ) {
    return AuditLogModel.find({ action })
      .sort({ createdAt: -1 })
      .limit(options?.limit || 100)
      .skip(options?.skip || 0)
      .exec();
  }

  static async findByResourceId(resourceType: string, resourceId: string) {
    return AuditLogModel.find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  static async findRecent(limit: number = 100) {
    return AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  static async search(filters: {
    userId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    limit?: number;
    skip?: number;
  }) {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.severity) query.severity = filters.severity;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.success !== undefined) query.success = filters.success;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .exec(),
      AuditLogModel.countDocuments(query),
    ]);

    return { logs, total };
  }

  static async getStats(options?: { startDate?: Date; endDate?: Date }) {
    const query: any = {};

    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }

    const [
      totalLogs,
      failedActions,
      criticalEvents,
      actionStats,
      severityStats,
    ] = await Promise.all([
      AuditLogModel.countDocuments(query),
      AuditLogModel.countDocuments({ ...query, success: false }),
      AuditLogModel.countDocuments({
        ...query,
        severity: AuditSeverity.CRITICAL,
      }),
      AuditLogModel.aggregate([
        { $match: query },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLogModel.aggregate([
        { $match: query },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalLogs,
      failedActions,
      criticalEvents,
      topActions: actionStats,
      severityBreakdown: severityStats,
    };
  }
}

export class AuditLogMutations {
  static async createLog(data: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    action: AuditAction;
    severity?: AuditSeverity;
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    };
    success?: boolean;
    errorMessage?: string;
  }) {
    const log = new AuditLogModel({
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      action: data.action,
      severity: data.severity || AuditSeverity.INFO,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      description: data.description,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      changes: data.changes,
      success: data.success !== undefined ? data.success : true,
      errorMessage: data.errorMessage,
    });

    return log.save();
  }

  static async deleteOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}
