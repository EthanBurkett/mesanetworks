import { PunchType } from "@/types/scheduling";
import { field, getModel, model, unique } from "../odm";
import { Errors } from "@/lib/api-utils";
import { parseDbError } from "@/utils/db-error-parser";

@model("Punch", {
  timestamps: true,
})
export class Punch {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true, ref: "User" })
  userId!: string;

  @field({ type: String, required: true, ref: "Location" })
  locationId!: string;

  @field({ type: String, required: true, ref: "Shift" })
  shiftId!: string;

  @field({ type: String, enum: [...Object.values(PunchType)], required: true })
  type!: PunchType;

  @field({ type: Date, required: true })
  timestamp!: Date;

  @field({ type: String })
  notes?: string;

  @field({ type: String })
  ipAddress?: string;

  @field({ type: Object })
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export const PunchModel = getModel(Punch);

export class PunchQueries {
  static async findAll() {
    return PunchModel.find()
      .populate("userId")
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Find punch by ID
   */
  static async findById(id: string) {
    return PunchModel.findById(id).exec();
  }

  /**
   * Find punch by ID with populated references
   */
  static async findByIdPopulated(id: string) {
    return PunchModel.findById(id)
      .populate("userId")
      .populate("locationId")
      .populate("shiftId")
      .exec();
  }

  /**
   * Get all punches for a user
   */
  static async findByUserId(userId: string) {
    return PunchModel.find({ userId })
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Get punches for a specific shift
   */
  static async findByShiftId(shiftId: string) {
    return PunchModel.find({ shiftId })
      .populate("userId")
      .populate("locationId")
      .sort({ timestamp: 1 })
      .exec();
  }

  /**
   * Get punches for a user within date range
   */
  static async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return PunchModel.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    })
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: 1 })
      .exec();
  }

  /**
   * Get punches for a location
   */
  static async findByLocationId(locationId: string) {
    return PunchModel.find({ locationId })
      .populate("userId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Get punches by type
   */
  static async findByType(type: PunchType, userId?: string) {
    const query: any = { type };
    if (userId) query.userId = userId;

    return PunchModel.find(query)
      .populate("userId")
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Get last punch for a user
   */
  static async findLastPunchForUser(userId: string) {
    return PunchModel.findOne({ userId })
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Get last punch of specific type for a shift
   */
  static async findLastPunchOfTypeForShift(shiftId: string, type: PunchType) {
    return PunchModel.findOne({ shiftId, type }).sort({ timestamp: -1 }).exec();
  }

  /**
   * Get all punches for a shift grouped by type
   */
  static async getPunchTimesForShift(shiftId: string) {
    const punches = await this.findByShiftId(shiftId);

    return {
      clockIn: punches.find((p) => p.type === PunchType.CLOCK_IN),
      clockOut: punches.find((p) => p.type === PunchType.CLOCK_OUT),
      breakStarts: punches.filter((p) => p.type === PunchType.BREAK_START),
      breakEnds: punches.filter((p) => p.type === PunchType.BREAK_END),
    };
  }

  /**
   * Calculate total break minutes for a shift
   */
  static async calculateBreakMinutesForShift(shiftId: string): Promise<number> {
    const punches = await this.findByShiftId(shiftId);

    const breakStarts = punches.filter((p) => p.type === PunchType.BREAK_START);
    const breakEnds = punches.filter((p) => p.type === PunchType.BREAK_END);

    let totalBreakMinutes = 0;

    for (let i = 0; i < Math.min(breakStarts.length, breakEnds.length); i++) {
      const startTime = breakStarts[i].timestamp.getTime();
      const endTime = breakEnds[i].timestamp.getTime();
      const breakMs = endTime - startTime;
      totalBreakMinutes += Math.floor(breakMs / 60000);
    }

    return totalBreakMinutes;
  }

  /**
   * Check if user has an active (unmatched) punch
   */
  static async hasActivePunch(
    userId: string,
    shiftId: string
  ): Promise<{
    hasActive: boolean;
    activeType?: PunchType;
    activePunch?: any;
  }> {
    const punches = await this.findByShiftId(shiftId);

    const clockIn = punches.find((p) => p.type === PunchType.CLOCK_IN);
    const clockOut = punches.find((p) => p.type === PunchType.CLOCK_OUT);

    // If clocked in but not clocked out
    if (clockIn && !clockOut) {
      // Check if on break
      const breakStarts = punches.filter(
        (p) => p.type === PunchType.BREAK_START
      );
      const breakEnds = punches.filter((p) => p.type === PunchType.BREAK_END);

      if (breakStarts.length > breakEnds.length) {
        return {
          hasActive: true,
          activeType: PunchType.BREAK_START,
          activePunch: breakStarts[breakStarts.length - 1],
        };
      }

      return {
        hasActive: true,
        activeType: PunchType.CLOCK_IN,
        activePunch: clockIn,
      };
    }

    return { hasActive: false };
  }

  /**
   * Get recent punches across all users (for admin)
   */
  static async findRecent(limit = 50) {
    return PunchModel.find()
      .populate("userId")
      .populate("locationId")
      .populate("shiftId")
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

export class PunchMutations {
  /**
   * Create a new punch
   */
  static async createPunch(data: {
    userId: string;
    locationId: string;
    shiftId: string;
    type: PunchType;
    timestamp: Date;
    notes?: string;
    ipAddress?: string;
    geolocation?: { latitude: number; longitude: number };
  }) {
    try {
      // Validate punch sequence
      await this.validatePunchSequence(data.shiftId, data.type);

      const punch = await PunchModel.create(data);
      return punch;
    } catch (error) {
      parseDbError(error);
    }
  }

  /**
   * Validate that punch type follows correct sequence
   */
  private static async validatePunchSequence(
    shiftId: string,
    newPunchType: PunchType
  ) {
    const punches = await PunchQueries.findByShiftId(shiftId);

    const clockIn = punches.find((p) => p.type === PunchType.CLOCK_IN);
    const clockOut = punches.find((p) => p.type === PunchType.CLOCK_OUT);
    const breakStarts = punches.filter((p) => p.type === PunchType.BREAK_START);
    const breakEnds = punches.filter((p) => p.type === PunchType.BREAK_END);

    switch (newPunchType) {
      case PunchType.CLOCK_IN:
        if (clockIn) {
          throw new Errors.BadRequest("Shift already has a clock-in");
        }
        break;

      case PunchType.CLOCK_OUT:
        if (!clockIn) {
          throw new Errors.BadRequest("Must clock in before clocking out");
        }
        if (clockOut) {
          throw new Errors.BadRequest("Shift already has a clock-out");
        }
        if (breakStarts.length > breakEnds.length) {
          throw new Errors.BadRequest("Must end break before clocking out");
        }
        break;

      case PunchType.BREAK_START:
        if (!clockIn) {
          throw new Errors.BadRequest("Must clock in before starting break");
        }
        if (clockOut) {
          throw new Errors.BadRequest("Cannot start break after clocking out");
        }
        if (breakStarts.length > breakEnds.length) {
          throw new Errors.BadRequest("Already on break");
        }
        break;

      case PunchType.BREAK_END:
        if (!clockIn) {
          throw new Errors.BadRequest("Must clock in before ending break");
        }
        if (breakStarts.length === 0) {
          throw new Errors.BadRequest("No break to end");
        }
        if (breakStarts.length === breakEnds.length) {
          throw new Errors.BadRequest("Not currently on break");
        }
        break;
    }
  }

  /**
   * Clock in for a shift
   */
  static async clockIn(
    userId: string,
    shiftId: string,
    locationId: string,
    timestamp: Date,
    metadata?: {
      ipAddress?: string;
      geolocation?: { latitude: number; longitude: number };
    }
  ) {
    return this.createPunch({
      userId,
      shiftId,
      locationId,
      type: PunchType.CLOCK_IN,
      timestamp,
      ...metadata,
    });
  }

  /**
   * Clock out for a shift
   */
  static async clockOut(
    userId: string,
    shiftId: string,
    locationId: string,
    timestamp: Date,
    metadata?: {
      ipAddress?: string;
      geolocation?: { latitude: number; longitude: number };
    }
  ) {
    return this.createPunch({
      userId,
      shiftId,
      locationId,
      type: PunchType.CLOCK_OUT,
      timestamp,
      ...metadata,
    });
  }

  /**
   * Start a break
   */
  static async startBreak(
    userId: string,
    shiftId: string,
    locationId: string,
    timestamp: Date,
    notes?: string
  ) {
    return this.createPunch({
      userId,
      shiftId,
      locationId,
      type: PunchType.BREAK_START,
      timestamp,
      notes,
    });
  }

  /**
   * End a break
   */
  static async endBreak(
    userId: string,
    shiftId: string,
    locationId: string,
    timestamp: Date,
    notes?: string
  ) {
    return this.createPunch({
      userId,
      shiftId,
      locationId,
      type: PunchType.BREAK_END,
      timestamp,
      notes,
    });
  }

  /**
   * Delete a punch (admin only, for corrections)
   * Note: Should validate this doesn't break punch sequence
   */
  static async deletePunch(id: string) {
    const punch = await PunchQueries.findById(id);
    if (!punch) {
      throw new Errors.NotFound("Punch not found");
    }

    // Could add additional validation here to ensure
    // deleting this punch doesn't break the sequence

    await PunchModel.findByIdAndDelete(id).exec();
    return punch;
  }

  /**
   * Add notes to a punch
   */
  static async addNotes(id: string, notes: string) {
    const punch = await PunchQueries.findById(id);
    if (!punch) {
      throw new Errors.NotFound("Punch not found");
    }

    punch.notes = notes;
    return punch.save();
  }
}
