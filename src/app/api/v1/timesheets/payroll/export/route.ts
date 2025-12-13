import { ShiftQueries } from "@/lib/db/models/Shift.model";
import { hasPermission, Permission, getUserPermissions } from "@/lib/rbac";
import { SessionQueries } from "@/lib/db/models/Session.model";
import { UserQueries } from "@/lib/db/models/User.model";
import { NextRequest, NextResponse } from "next/server";
import { ShiftStatus } from "@/types/scheduling";
import { format } from "date-fns";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export const GET = async (request: NextRequest) => {
  try {
    // Get user from request (same as api-utils)
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, code: 401, messages: ["Authentication required"] },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // Check session in database
    const session = await SessionQueries.findByToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, code: 401, messages: ["Invalid session"] },
        { status: 401 }
      );
    }

    // Load user from database
    const user = await UserQueries.findByAuth0IdAndPopulate(decoded.sub);
    if (!user) {
      return NextResponse.json(
        { success: false, code: 401, messages: ["User not found"] },
        { status: 401 }
      );
    }

    // Get permissions
    const roleIds = (user.roles || []).map((role: any) =>
      typeof role === "string" ? role : role._id.toString()
    );
    const effectivePermissions = await getUserPermissions(roleIds);

    // Check permissions
    if (!effectivePermissions.includes(Permission.MANAGER_READ_SHIFT_ANY)) {
      return NextResponse.json(
        { success: false, code: 403, messages: ["Insufficient permissions"] },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const status = url.searchParams.get("status");

    // Default to approved shifts if no status specified
    const statusFilter = status || ShiftStatus.APPROVED;

    let shifts;
    if (startDate && endDate) {
      const allShifts = await ShiftQueries.findByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      shifts = allShifts.filter((s) => s.status === statusFilter);
    } else {
      shifts = await ShiftQueries.findByStatus(statusFilter as ShiftStatus);
    }

    // Build CSV content
    const headers = [
      "Employee Name",
      "Date",
      "Day",
      "Location",
      "Clock In",
      "Clock Out",
      "Break (min)",
      "Regular Hours",
      "Overtime Hours",
      "Total Hours",
      "Status",
      "Approved By",
      "Notes",
    ];

    const rows = shifts.map((shift) => {
      const employeeName =
        typeof shift.userId !== "string" && (shift.userId as any)?.firstName
          ? `${(shift.userId as any).firstName} ${
              (shift.userId as any).lastName || ""
            }`.trim()
          : "Unknown Employee";

      const location =
        typeof shift.locationId !== "string"
          ? (shift.locationId as any)?.name || ""
          : shift.locationId;

      const shiftDate = shift.actualStart
        ? new Date(shift.actualStart)
        : new Date(shift.scheduledStart);
      const dateStr = format(shiftDate, "MMM d, yyyy");
      const dayOfWeek = format(shiftDate, "EEE");

      // Work hours from database
      const totalHours = (shift.totalMinutes || 0) / 60;
      const breakMinutes = shift.breakMinutes || 0;

      // Calculate overtime (anything over 8 hours in a day)
      const overtimeHours = Math.max(totalHours - 8, 0);
      const regularHours = Math.min(totalHours, 8);

      const approvedBy =
        typeof shift.overrideApprovedBy !== "string" &&
        (shift.overrideApprovedBy as any)?.firstName
          ? `${(shift.overrideApprovedBy as any).firstName} ${
              (shift.overrideApprovedBy as any).lastName || ""
            }`.trim()
          : "";

      return [
        employeeName,
        dateStr,
        dayOfWeek,
        location,
        shift.actualStart ? format(new Date(shift.actualStart), "h:mm a") : "-",
        shift.actualEnd ? format(new Date(shift.actualEnd), "h:mm a") : "-",
        breakMinutes.toString(),
        regularHours.toFixed(2),
        overtimeHours.toFixed(2),
        totalHours.toFixed(2),
        shift.status,
        approvedBy,
        shift.notes || "",
      ];
    });

    // Calculate totals
    const totalBreakMinutes = shifts.reduce(
      (sum, s) => sum + (s.breakMinutes || 0),
      0
    );
    const totalRegularHours = shifts.reduce((sum, s) => {
      const hours = (s.totalMinutes || 0) / 60;
      return sum + Math.min(hours, 8);
    }, 0);
    const totalOvertimeHours = shifts.reduce((sum, s) => {
      const hours = (s.totalMinutes || 0) / 60;
      return sum + Math.max(hours - 8, 0);
    }, 0);
    const totalHours = shifts.reduce(
      (sum, s) => sum + (s.totalMinutes || 0) / 60,
      0
    );

    // Escape CSV values
    const escapeCsvValue = (value: string | number) => {
      const strValue = String(value);
      if (
        strValue.includes(",") ||
        strValue.includes('"') ||
        strValue.includes("\n")
      ) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    const csvLines = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
      "", // Empty line before totals
      `TOTALS,,,,,${totalBreakMinutes},${totalRegularHours.toFixed(
        2
      )},${totalOvertimeHours.toFixed(2)},${totalHours.toFixed(2)},,`,
      "", // Empty line
      `Total Shifts: ${shifts.length}`,
      `Regular Hours: ${totalRegularHours.toFixed(2)}`,
      `Overtime Hours: ${totalOvertimeHours.toFixed(2)}`,
      `Total Hours: ${totalHours.toFixed(2)}`,
      `Total Break Time: ${totalBreakMinutes} minutes`,
    ];

    const csvContent = csvLines.join("\n");

    // Generate filename with date range or current date
    const filename =
      startDate && endDate
        ? `payroll_${startDate}_to_${endDate}.csv`
        : `payroll_${format(new Date(), "yyyy-MM-dd")}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Payroll export error:", error);
    return NextResponse.json(
      {
        success: false,
        code: 500,
        messages: ["Failed to export payroll data"],
      },
      { status: 500 }
    );
  }
};
