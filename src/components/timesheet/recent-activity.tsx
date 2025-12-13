"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Clock, Coffee } from "lucide-react";
import { useMyShifts, useMyPunches } from "@/hooks";
import { ShiftStatus, PunchType } from "@/types/scheduling";
import { format } from "date-fns";

export function RecentActivity() {
  const { data: shifts, isLoading: shiftsLoading } = useMyShifts();
  const { data: allPunches, isLoading: punchesLoading } = useMyPunches();

  const isLoading = shiftsLoading || punchesLoading;

  // Get completed shifts and calculate their details
  const recentShifts =
    shifts
      ?.filter(
        (shift) =>
          shift.status === ShiftStatus.COMPLETED ||
          shift.status === ShiftStatus.APPROVED
      )
      ?.sort(
        (a, b) =>
          new Date(b.scheduledStart).getTime() -
          new Date(a.scheduledStart).getTime()
      )
      ?.slice(0, 5) || [];

  const getShiftPunches = (shiftId: string) => {
    return allPunches?.filter((p) => p.shiftId === shiftId) || [];
  };

  const calculateShiftDetails = (shift: any) => {
    const punches = getShiftPunches(shift._id);
    const clockIn = punches.find((p) => p.type === PunchType.CLOCK_IN);
    const clockOut = punches.find((p) => p.type === PunchType.CLOCK_OUT);

    if (!clockIn || !clockOut) {
      return { clockIn: "-", clockOut: "-", breaks: 0, total: 0 };
    }

    const start = new Date(clockIn.timestamp);
    const end = new Date(clockOut.timestamp);

    // Use totalMinutes and breakMinutes from shift if available
    const breakMinutes = shift.breakMinutes ?? 0;
    const totalMinutes = shift.totalMinutes ?? 0;
    const totalHours = totalMinutes / 60;

    return {
      clockIn: format(start, "h:mm a"),
      clockOut: format(end, "h:mm a"),
      breaks: breakMinutes,
      total: totalHours,
    };
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-2">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (recentShifts.length === 0) {
    return (
      <Card className="p-6 border-2">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <p className="text-center text-muted-foreground py-8">
          No recent activity to display
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Recent Activity</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Breaks</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentShifts.map((shift) => {
              const details = calculateShiftDetails(shift);
              return (
                <TableRow key={shift._id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>
                        {format(new Date(shift.scheduledStart), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(shift.scheduledStart), "EEEE")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{details.clockIn}</TableCell>
                  <TableCell>{details.clockOut}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coffee className="h-3 w-3 text-muted-foreground" />
                      <span>{details.breaks} min</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {details.total.toFixed(2)} hrs
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        shift.status === ShiftStatus.APPROVED
                          ? "default"
                          : "secondary"
                      }
                    >
                      {shift.status === ShiftStatus.APPROVED
                        ? "Approved"
                        : "Completed"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
