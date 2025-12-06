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
import {
  Clock,
  Calendar,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  StopCircle,
  PauseCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks";

// Mock data - will be replaced with real data later
const mockTimesheetData = [
  {
    id: 1,
    date: "2025-12-06",
    day: "Friday",
    clockIn: "08:55 AM",
    clockOut: "05:10 PM",
    breaks: [
      { start: "12:00 PM", end: "12:30 PM", duration: 30 },
      { start: "03:00 PM", end: "03:15 PM", duration: 15 },
    ],
    totalBreak: 45,
    regularHours: 7.75,
    overtimeHours: 0,
    status: "completed",
  },
  {
    id: 2,
    date: "2025-12-05",
    day: "Thursday",
    clockIn: "09:02 AM",
    clockOut: "05:05 PM",
    breaks: [{ start: "12:15 PM", end: "12:45 PM", duration: 30 }],
    totalBreak: 30,
    regularHours: 7.55,
    overtimeHours: 0,
    status: "completed",
  },
  {
    id: 3,
    date: "2025-12-04",
    day: "Wednesday",
    clockIn: "08:58 AM",
    clockOut: "06:30 PM",
    breaks: [
      { start: "12:00 PM", end: "12:40 PM", duration: 40 },
      { start: "03:30 PM", end: "03:45 PM", duration: 15 },
    ],
    totalBreak: 55,
    regularHours: 8.0,
    overtimeHours: 1.62,
    status: "completed",
  },
  {
    id: 4,
    date: "2025-12-03",
    day: "Tuesday",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    breaks: [{ start: "12:00 PM", end: "12:30 PM", duration: 30 }],
    totalBreak: 30,
    regularHours: 7.5,
    overtimeHours: 0,
    status: "completed",
  },
  {
    id: 5,
    date: "2025-12-02",
    day: "Monday",
    clockIn: "08:55 AM",
    clockOut: "05:15 PM",
    breaks: [{ start: "12:30 PM", end: "01:00 PM", duration: 30 }],
    totalBreak: 30,
    regularHours: 7.83,
    overtimeHours: 0,
    status: "completed",
  },
];

export default function TimesheetPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("current-week");
  const [clockStatus, setClockStatus] = useState<
    "clocked-out" | "clocked-in" | "on-break"
  >("clocked-out");
  const [currentTime, setCurrentTime] = useState("00:00:00");

  const totalRegularHours = mockTimesheetData.reduce(
    (sum, entry) => sum + entry.regularHours,
    0
  );
  const totalOvertimeHours = mockTimesheetData.reduce(
    (sum, entry) => sum + entry.overtimeHours,
    0
  );
  const totalHours = totalRegularHours + totalOvertimeHours;

  const handleClockIn = () => {
    setClockStatus("clocked-in");
    // TODO: Implement actual clock-in logic
  };

  const handleClockOut = () => {
    setClockStatus("clocked-out");
    // TODO: Implement actual clock-out logic
  };

  const handleBreak = () => {
    setClockStatus((prev) => (prev === "on-break" ? "clocked-in" : "on-break"));
    // TODO: Implement actual break logic
  };

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
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Clock In/Out Card */}
      <Card className="p-6 border-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Time Clock</h2>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="text-4xl font-bold font-mono tabular-nums">
                {currentTime}
              </div>
              <Badge
                variant={
                  clockStatus === "clocked-in"
                    ? "default"
                    : clockStatus === "on-break"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm"
              >
                {clockStatus === "clocked-in"
                  ? "Clocked In"
                  : clockStatus === "on-break"
                  ? "On Break"
                  : "Clocked Out"}
              </Badge>
            </div>
            {clockStatus === "clocked-in" && (
              <p className="text-sm text-muted-foreground mt-2">
                Started at 8:55 AM
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {clockStatus === "clocked-out" ? (
              <Button
                size="lg"
                onClick={handleClockIn}
                className="gap-2 min-w-[140px]"
              >
                <PlayCircle className="h-5 w-5" />
                Clock In
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant={clockStatus === "on-break" ? "default" : "outline"}
                  onClick={handleBreak}
                  className="gap-2 min-w-[140px]"
                >
                  {clockStatus === "on-break" ? (
                    <>
                      <PlayCircle className="h-5 w-5" />
                      End Break
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-5 w-5" />
                      Start Break
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleClockOut}
                  className="gap-2 min-w-[140px]"
                  disabled={clockStatus === "on-break"}
                >
                  <StopCircle className="h-5 w-5" />
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </div>

        {clockStatus === "on-break" && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                You are currently on break
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200 mt-0.5">
                Make sure to clock back in when you return
              </p>
            </div>
          </div>
        )}
      </Card>

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overtime
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalOvertimeHours.toFixed(2)} hrs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Timesheet Table */}
      <Card className="border-2">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Time Entries</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">Dec 2-8, 2025</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Breaks</TableHead>
                <TableHead className="text-right">Regular</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimesheetData.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.day}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.date}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.clockIn}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.clockOut}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {entry.breaks.map((brk, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-muted-foreground"
                        >
                          {brk.start} - {brk.end} ({brk.duration}m)
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.regularHours.toFixed(2)} hrs
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.overtimeHours > 0 ? (
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {entry.overtimeHours.toFixed(2)} hrs
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0.00 hrs</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {(entry.regularHours + entry.overtimeHours).toFixed(2)} hrs
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 border-t bg-muted/30">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {mockTimesheetData.length} entries for current week
            </p>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Regular</p>
                <p className="text-lg font-bold">
                  {totalRegularHours.toFixed(2)} hrs
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Overtime</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {totalOvertimeHours.toFixed(2)} hrs
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-lg font-bold">{totalHours.toFixed(2)} hrs</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes Section */}
      <Card className="p-6 border-2">
        <h3 className="text-lg font-semibold mb-3">Notes & Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Regular hours are calculated up to 8 hours per day (40 hours per
              week)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Any hours beyond 8 per day are counted as overtime</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Break times are automatically deducted from your total hours
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Please ensure you clock out before end of shift to maintain
              accurate records
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
