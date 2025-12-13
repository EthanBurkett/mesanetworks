import { z } from "zod";
import { ShiftStatus, PunchType } from "@/types/scheduling";

// Schedule (Shift) Schemas
export const createScheduleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  locationId: z.string().min(1, "Location ID is required"),
  scheduledStart: z.string().datetime("Invalid start date"),
  scheduledEnd: z.string().datetime("Invalid end date"),
  notes: z.string().optional(),
  overrideAllowed: z.boolean().optional(),
});

export const updateScheduleSchema = z.object({
  userId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  notes: z.string().optional(),
  overrideAllowed: z.boolean().optional(),
});

export const approveShiftSchema = z.object({
  approve: z.boolean(),
});

// Punch Schemas
export const createPunchSchema = z.object({
  shiftId: z.string().min(1, "Shift ID is required"),
  locationId: z.string().min(1, "Location ID is required"),
  type: z.enum([
    PunchType.CLOCK_IN,
    PunchType.CLOCK_OUT,
    PunchType.BREAK_START,
    PunchType.BREAK_END,
  ]),
  timestamp: z.string().datetime().optional(), // Optional, defaults to now
  notes: z.string().optional(),
  geolocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export const updatePunchNotesSchema = z.object({
  notes: z.string(),
});

export type CreateScheduleSchema = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleSchema = z.infer<typeof updateScheduleSchema>;
export type ApproveShiftSchema = z.infer<typeof approveShiftSchema>;
export type CreatePunchSchema = z.infer<typeof createPunchSchema>;
export type UpdatePunchNotesSchema = z.infer<typeof updatePunchNotesSchema>;
