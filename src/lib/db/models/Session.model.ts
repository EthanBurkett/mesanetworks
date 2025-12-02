import { field, getModel, model, index, compoundIndex, unique } from "../odm";
import { Errors } from "@/lib/api-utils";
import type { Types } from "mongoose";

@model("Session", { timestamps: true })
@compoundIndex({ auth0Id: 1, isActive: 1 })
@compoundIndex({ sessionToken: 1, isActive: 1 })
export class Session {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  @field({ type: String, required: true })
  @index()
  userId!: string;

  @field({ type: String, required: true })
  @index()
  auth0Id!: string;

  @field({ type: String, required: true })
  @unique()
  sessionToken!: string;

  @field({ type: String, required: true })
  ipAddress!: string;

  @field({ type: String, required: true })
  userAgent!: string;

  @field({ type: String })
  deviceType?: string;

  @field({ type: String })
  deviceName?: string;

  @field({ type: String })
  browser?: string;

  @field({ type: String })
  os?: string;

  @field({ type: Object })
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @field({ type: Boolean, default: true })
  @index()
  isActive!: boolean;

  @field({ type: Date, default: () => new Date() })
  lastActiveAt!: Date;

  @field({ type: Date, required: true })
  @index()
  expiresAt!: Date;
}

export const SessionModel = getModel(Session);

// Create TTL index for automatic cleanup
SessionModel.collection.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export class SessionQueries {
  static identifier(identifier: string) {
    return {
      $or: [{ userId: identifier.toString() }, { auth0Id: identifier }],
    };
  }

  static async findByToken(sessionToken: string) {
    return SessionModel.findOne({ sessionToken, isActive: true }).exec();
  }

  static async findActiveSessionsByUser(identifier: string) {
    return SessionModel.find({
      ...this.identifier(identifier),
      isActive: true,
    })
      .sort({ lastActiveAt: -1 })
      .exec();
  }

  static async findSessionById(id: string) {
    return SessionModel.findById(id).exec();
  }

  static async countActiveSessions(auth0Id: string) {
    return SessionModel.countDocuments({ auth0Id, isActive: true }).exec();
  }
}

export class SessionMutations {
  static async createSession(data: {
    userId: string;
    auth0Id: string;
    sessionToken: string;
    ipAddress: string;
    userAgent: string;
    deviceInfo?: {
      deviceType?: string;
      deviceName?: string;
      browser?: string;
      os?: string;
    };
    location?: {
      country?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
    expiresAt: Date;
  }) {
    const session = new SessionModel({
      userId: data.userId,
      auth0Id: data.auth0Id,
      sessionToken: data.sessionToken,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceType: data.deviceInfo?.deviceType,
      deviceName: data.deviceInfo?.deviceName,
      browser: data.deviceInfo?.browser,
      os: data.deviceInfo?.os,
      location: data.location,
      expiresAt: data.expiresAt,
      lastActiveAt: new Date(),
    });

    return session.save();
  }

  static async updateLastActive(sessionToken: string) {
    const session = await SessionModel.findOneAndUpdate(
      { sessionToken, isActive: true },
      { lastActiveAt: new Date() },
      { new: true }
    ).exec();

    if (!session) {
      throw new Errors.Unauthorized("Session not found or expired");
    }

    return session;
  }

  static async revokeSession(sessionToken: string) {
    const session = await SessionModel.findOneAndUpdate(
      { sessionToken },
      { isActive: false },
      { new: true }
    ).exec();

    if (!session) {
      throw new Errors.NotFound("Session not found");
    }

    return session;
  }

  static async revokeAllUserSessions(auth0Id: string, exceptToken?: string) {
    const query: any = { auth0Id, isActive: true };
    if (exceptToken) {
      query.sessionToken = { $ne: exceptToken };
    }

    await SessionModel.updateMany(query, { isActive: false }).exec();
  }

  static async revokeSessionById(id: string) {
    const session = await SessionModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!session) {
      throw new Errors.NotFound("Session not found");
    }

    return session;
  }

  static async cleanupExpiredSessions() {
    const result = await SessionModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { isActive: false }],
    }).exec();

    if (!result) {
      throw new Errors.InternalServer("Failed to cleanup sessions");
    }

    return result.acknowledged;
  }
}
