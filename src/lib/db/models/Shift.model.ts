import { ShiftStatus } from "@/types/scheduling";
import { field, getModel, model, unique } from "../odm";
import { Errors } from "@/lib/api-utils";
import { parseDbError } from "@/utils/db-error-parser";

@model("Shift", {
  timestamps: true,
})
export class Shift {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true, ref: "User" })
  managerId!: string;

  @field({ type: String, required: true, ref: "User" })
  userId!: string;

  @field({ type: String, required: true, ref: "Location" })
  locationId!: string;

  @field({ type: Date, required: true })
  scheduledStart!: Date;

  @field({ type: Date, required: true })
  scheduledEnd!: Date;

  @field({ type: Date, required: false })
  actualStart?: Date;

  @field({ type: Date, required: false })
  actualEnd?: Date;

  @field({ type: Number, default: 0 })
  totalMinutes!: number;

  @field({ type: Number, default: 0 })
  breakMinutes!: number;

  @field({ type: Number, default: 0 })
  varianceMinutes!: number;

  @field({
    type: String,
    enum: [...Object.values(ShiftStatus)],
    default: ShiftStatus.SCHEDULED,
  })
  status!: ShiftStatus;

  @field({ type: Boolean, default: false })
  overrideAllowed!: boolean;

  @field({ type: String, ref: "User" })
  overrideApprovedBy?: string;

  @field({ type: Date })
  overrideApprovedAt?: Date;

  @field({ type: String })
  notes?: string;
}

export const ShiftModel = getModel(Shift);

export class ShiftQueries {
  /**
   * Find shift by ID
   */
  static async findById(id: string) {
    return ShiftModel.findById(id)
      .populate("locationId")
      .populate("managerId")
      .populate("userId")
      .exec();
  }

  static async findByUserIdAndShiftId(userId: string, shiftId: string) {
    return ShiftModel.findOne({ userId, _id: shiftId })
      .populate("locationId")
      .populate("managerId")
      .populate("userId")
      .exec();
  }

  static async findAll() {
    return ShiftModel.find()
      .populate("userId")
      .populate("managerId")
      .populate("locationId")
      .exec();
  }

  /**
   * Find shift by ID with populated references
   */
  static async findByIdPopulated(id: string) {
    return ShiftModel.findById(id)
      .populate("userId")
      .populate("managerId")
      .populate("locationId")
      .exec();
  }

  /**
   * Get all shifts for a user
   */
  static async findByUserId(userId: string, status?: ShiftStatus) {
    const query: any = { userId };
    if (status) query.status = status;

    return ShiftModel.find(query)
      .populate("locationId")
      .populate("managerId")
      .sort({ scheduledStart: -1 })
      .exec();
  }

  /**
   * Get shifts for a user within a date range
   */
  static async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return ShiftModel.find({
      userId,
      scheduledStart: { $gte: startDate, $lte: endDate },
    })
      .populate("locationId")
      .populate("managerId")
      .sort({ scheduledStart: 1 })
      .exec();
  }

  /**
   * Get shifts created by a manager
   */
  static async findByManagerId(managerId: string, status?: ShiftStatus) {
    const query: any = { managerId };
    if (status) query.status = status;

    return ShiftModel.find(query)
      .populate("userId")
      .populate("locationId")
      .sort({ scheduledStart: -1 })
      .exec();
  }

  /**
   * Get shifts for a location
   */
  static async findByLocationId(locationId: string, status?: ShiftStatus) {
    const query: any = { locationId };
    if (status) query.status = status;

    return ShiftModel.find(query)
      .populate("userId")
      .populate("managerId")
      .sort({ scheduledStart: -1 })
      .exec();
  }

  /**
   * Get shifts by status
   */
  static async findByStatus(status: ShiftStatus) {
    return ShiftModel.find({ status })
      .populate("userId")
      .populate("managerId")
      .populate("locationId")
      .sort({ scheduledStart: -1 })
      .exec();
  }

  /**
   * Get upcoming shifts for a user
   */
  static async findUpcomingForUser(userId: string, limit = 10) {
    const now = new Date();
    return ShiftModel.find({
      userId,
      scheduledStart: { $gte: now },
      status: { $in: [ShiftStatus.SCHEDULED, ShiftStatus.IN_PROGRESS] },
    })
      .populate("locationId")
      .populate("managerId")
      .sort({ scheduledStart: 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get current active shift for a user
   */
  static async findActiveShiftForUser(userId: string) {
    const now = new Date();
    return ShiftModel.findOne({
      userId,
      status: ShiftStatus.IN_PROGRESS,
      scheduledStart: { $lte: now },
    })
      .populate("locationId")
      .populate("managerId")
      .exec();
  }

  /**
   * Find shift that a user should be working at a given time
   */
  static async findShiftAtTime(userId: string, timestamp: Date) {
    return ShiftModel.findOne({
      userId,
      scheduledStart: { $lte: timestamp },
      scheduledEnd: { $gte: timestamp },
    })
      .populate("locationId")
      .populate("managerId")
      .exec();
  }

  /**
   * Get shifts pending approval
   */
  static async findPendingApproval(managerId?: string) {
    const query: any = { status: ShiftStatus.COMPLETED };
    if (managerId) query.managerId = managerId;

    return ShiftModel.find(query)
      .populate("userId")
      .populate("locationId")
      .populate("managerId")
      .sort({ actualEnd: -1 })
      .exec();
  }

  /**
   * Get all shifts within date range
   */
  static async findByDateRange(startDate: Date, endDate: Date) {
    return ShiftModel.find({
      scheduledStart: { $gte: startDate, $lte: endDate },
    })
      .populate("userId")
      .populate("managerId")
      .populate("locationId")
      .sort({ scheduledStart: 1 })
      .exec();
  }
}

export class ShiftMutations {
  /**
   * Create a new shift
   */
  static async createShift(data: {
    managerId: string;
    userId: string;
    locationId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    notes?: string;
    overrideAllowed?: boolean;
  }) {
    try {
      // Validate that scheduled end is after scheduled start
      if (data.scheduledEnd <= data.scheduledStart) {
        throw new Errors.BadRequest(
          "Scheduled end time must be after start time"
        );
      }

      const shift = await ShiftModel.create({
        ...data,
        status: ShiftStatus.SCHEDULED,
      });

      return shift;
    } catch (error) {
      parseDbError(error);
    }
  }

  /**
   * Update shift details (only for scheduled shifts)
   */
  static async updateShift(
    id: string,
    data: {
      userId?: string;
      locationId?: string;
      scheduledStart?: Date;
      scheduledEnd?: Date;
      notes?: string;
      overrideAllowed?: boolean;
    }
  ) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new Errors.BadRequest(
        "Cannot update shift that has already started or completed"
      );
    }

    if (data.userId !== undefined) shift.userId = data.userId;
    if (data.locationId !== undefined) shift.locationId = data.locationId;
    if (data.scheduledStart !== undefined)
      shift.scheduledStart = data.scheduledStart;
    if (data.scheduledEnd !== undefined) shift.scheduledEnd = data.scheduledEnd;
    if (data.notes !== undefined) shift.notes = data.notes;
    if (data.overrideAllowed !== undefined)
      shift.overrideAllowed = data.overrideAllowed;

    // Validate times
    if (shift.scheduledEnd <= shift.scheduledStart) {
      throw new Errors.BadRequest(
        "Scheduled end time must be after start time"
      );
    }

    return shift.save();
  }

  /**
   * Start a shift (set to IN_PROGRESS)
   */
  static async startShift(id: string, actualStart: Date) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new Errors.BadRequest("Shift has already been started");
    }

    shift.status = ShiftStatus.IN_PROGRESS;
    shift.actualStart = actualStart;

    return shift.save();
  }

  /**
   * Complete a shift (set to COMPLETED)
   */
  static async completeShift(
    id: string,
    actualEnd: Date,
    breakMinutes: number = 0
  ) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status !== ShiftStatus.IN_PROGRESS) {
      throw new Errors.BadRequest("Shift is not in progress");
    }

    if (!shift.actualStart) {
      throw new Errors.BadRequest("Shift has no start time");
    }

    shift.status = ShiftStatus.COMPLETED;
    shift.actualEnd = actualEnd;
    shift.breakMinutes = breakMinutes;

    // Calculate total minutes worked (excluding breaks)
    const totalMs = actualEnd.getTime() - shift.actualStart.getTime();
    const totalMinutes = Math.max(
      Math.floor(totalMs / 60000) - breakMinutes,
      0
    );
    shift.totalMinutes = totalMinutes;

    // Calculate variance from scheduled time
    const scheduledMs =
      shift.scheduledEnd.getTime() - shift.scheduledStart.getTime();
    const scheduledMinutes = Math.floor(scheduledMs / 60000);
    shift.varianceMinutes = totalMinutes - scheduledMinutes;

    return shift.save();
  }

  /**
   * Approve a completed shift
   */
  static async approveShift(id: string, approvedBy: string) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status !== ShiftStatus.COMPLETED) {
      throw new Errors.BadRequest("Can only approve completed shifts");
    }

    shift.status = ShiftStatus.APPROVED;
    shift.overrideApprovedBy = approvedBy;
    shift.overrideApprovedAt = new Date();

    return shift.save();
  }

  /**
   * Cancel a shift
   */
  static async cancelShift(id: string) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status === ShiftStatus.APPROVED) {
      throw new Errors.BadRequest("Cannot cancel an approved shift");
    }

    shift.status = ShiftStatus.CANCELLED;
    return shift.save();
  }

  /**
   * Enable override for a shift
   */
  static async enableOverride(
    id: string,
    approvedBy: string,
    allow: boolean = true
  ) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    shift.overrideAllowed = allow;
    if (allow) {
      shift.overrideApprovedBy = approvedBy;
      shift.overrideApprovedAt = new Date();
    }

    return shift.save();
  }

  /**
   * Delete a shift (hard delete, only for scheduled shifts)
   */
  static async deleteShift(id: string) {
    const shift = await ShiftQueries.findById(id);
    if (!shift) {
      throw new Errors.NotFound("Shift not found");
    }

    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new Errors.BadRequest("Can only delete scheduled shifts");
    }

    await ShiftModel.findByIdAndDelete(id).exec();
    return shift;
  }
}
