"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Download, Coffee, Loader2, Calendar } from "lucide-react";
import { useState } from "react";
import { useMyShifts, useMyPunches } from "@/hooks";
import { ShiftStatus, PunchType } from "@/types/scheduling";
import { TimeClockCard } from "@/components/timesheet/time-clock-card";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

export default function TimesheetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-week");

  const { data: shifts, isLoading: shiftsLoading } = useMyShifts();
  const { data: allPunches, isLoading: punchesLoading } = useMyPunches();

  const isLoading = shiftsLoading || punchesLoading;

  // Filter shifts based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case "current-week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "last-week":
        const lastWeek = subWeeks(now, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      case "current-month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "last-month":
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      default:
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
    }
  };

  const dateRange = getDateRange();

  const filteredShifts =
    shifts?.filter((shift) => {
      const shiftDate = new Date(shift.scheduledStart);
      return shiftDate >= dateRange.start && shiftDate <= dateRange.end;
    }) || [];

  const completedShifts = filteredShifts.filter(
    (shift) =>
      shift.status === ShiftStatus.COMPLETED ||
      shift.status === ShiftStatus.APPROVED
  );

  const getShiftPunches = (shiftId: string) => {
    return allPunches?.filter((p) => p.shiftId === shiftId) || [];
  };

  const calculateShiftDetails = (shift: any) => {
    const punches = getShiftPunches(shift._id);
    const clockIn = punches.find((p) => p.type === PunchType.CLOCK_IN);
    const clockOut = punches.find((p) => p.type === PunchType.CLOCK_OUT);

    if (!clockIn || !clockOut) {
      return {
        clockIn: "-",
        clockOut: "-",
        breaks: 0,
        regularHours: 0,
        overtimeHours: 0,
      };
    }

    const start = new Date(clockIn.timestamp);
    const end = new Date(clockOut.timestamp);

    // Calculate break time
    let breakMinutes = 0;
    for (let i = 0; i < punches.length; i++) {
      if (
        punches[i].type === PunchType.BREAK_START &&
        punches[i + 1]?.type === PunchType.BREAK_END
      ) {
        const breakStart = new Date(punches[i].timestamp);
        const breakEnd = new Date(punches[i + 1].timestamp);
        breakMinutes +=
          (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      }
    }

    // Use totalMinutes from shift if available, otherwise calculate
    const totalMinutes =
      shift.totalMinutes ??
      Math.max(
        (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes,
        0
      );
    const totalHours = totalMinutes / 60;
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(totalHours - 8, 0);

    return {
      clockIn: format(start, "h:mm a"),
      clockOut: format(end, "h:mm a"),
      breaks: breakMinutes,
      regularHours,
      overtimeHours,
    };
  };

  const totalRegularHours = completedShifts.reduce((sum, shift) => {
    const details = calculateShiftDetails(shift);
    return sum + details.regularHours;
  }, 0);

  const totalOvertimeHours = completedShifts.reduce((sum, shift) => {
    const details = calculateShiftDetails(shift);
    return sum + details.overtimeHours;
  }, 0);

  const totalHours = totalRegularHours + totalOvertimeHours;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your work hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">Current Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Clock In/Out Card */}
      <TimeClockCard />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Hours
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalHours.toFixed(2)} hrs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Regular Hours
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalRegularHours.toFixed(2)} hrs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-emerald-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overtime Hours
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalOvertimeHours.toFixed(2)} hrs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Coffee className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Timesheet Table */}
      <Card className="p-6 border-2">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Detailed Timesheet</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : completedShifts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No timesheet data for the selected period
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Breaks</TableHead>
                  <TableHead>Regular Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedShifts.map((shift) => {
                  const details = calculateShiftDetails(shift);
                  return (
                    <TableRow key={shift._id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>
                            {format(
                              new Date(shift.scheduledStart),
                              "MMM d, yyyy"
                            )}
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
                        {details.regularHours.toFixed(2)} hrs
                      </TableCell>
                      <TableCell className="font-medium">
                        {details.overtimeHours > 0 ? (
                          <span className="text-orange-600 dark:text-orange-400">
                            {details.overtimeHours.toFixed(2)} hrs
                          </span>
                        ) : (
                          "0.00 hrs"
                        )}
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
        )}
      </Card>
    </div>
  );
}
