"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSchedules } from "@/hooks";
import { ShiftStatus } from "@/types/scheduling";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShiftGroup {
  time: string;
  employees: Array<{
    id: string;
    name: string;
    email: string;
    location: string;
    status: ShiftStatus;
    shiftId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }>;
}

export function ScheduleCalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: schedules, isLoading } = useSchedules();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getShiftsForDay = (day: Date) => {
    return (
      schedules?.filter((shift) =>
        isSameDay(new Date(shift.scheduledStart), day)
      ) || []
    );
  };

  const groupShiftsByTime = (shifts: typeof schedules): ShiftGroup[] => {
    if (!shifts) return [];

    const groups = new Map<string, ShiftGroup["employees"]>();

    shifts.forEach((shift) => {
      const timeKey = `${format(
        new Date(shift.scheduledStart),
        "h:mm a"
      )} - ${format(new Date(shift.scheduledEnd), "h:mm a")}`;

      if (!groups.has(timeKey)) {
        groups.set(timeKey, []);
      }

      if (typeof shift.userId === "object") {
        groups.get(timeKey)?.push({
          id: shift.userId._id,
          name:
            shift.userId.displayName ||
            `${shift.userId.firstName} ${shift.userId.lastName}`,
          email: shift.userId.email,
          location:
            typeof shift.locationId === "object"
              ? shift.locationId.name
              : shift.locationId,
          status: shift.status,
          shiftId: shift._id,
          scheduledStart: new Date(shift.scheduledStart),
          scheduledEnd: new Date(shift.scheduledEnd),
        });
      }
    });

    return Array.from(groups.entries()).map(([time, employees]) => ({
      time,
      employees,
    }));
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return "bg-blue-500";
      case ShiftStatus.IN_PROGRESS:
        return "bg-green-500";
      case ShiftStatus.COMPLETED:
        return "bg-purple-500";
      case ShiftStatus.APPROVED:
        return "bg-emerald-500";
      case ShiftStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const selectedDayShifts = selectedDate ? getShiftsForDay(selectedDate) : [];
  const groupedShifts = groupShiftsByTime(selectedDayShifts);

  if (isLoading) {
    return (
      <Card className="p-6 border-2">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Schedule Calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <p className="font-semibold text-lg">
                {format(currentMonth, "MMMM yyyy")}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day) => {
            const dayShifts = getShiftsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasShifts = dayShifts.length > 0;
            const employeeCount = new Set(
              dayShifts.map((s) =>
                typeof s.userId === "string" ? s.userId : s.userId._id
              )
            ).size;

            return (
              <button
                type="button"
                key={day.toISOString()}
                onClick={() => hasShifts && setSelectedDate(day)}
                className={`
                  min-h-[120px] p-2 rounded-lg border-2 transition-all
                  ${!isCurrentMonth && "opacity-40"}
                  ${isToday && "border-primary bg-primary/5"}
                  ${!isToday && "border-border"}
                  ${hasShifts && "hover:border-primary/50 cursor-pointer"}
                  ${!hasShifts && "cursor-default"}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className="text-left mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isToday && "text-primary"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  {hasShifts && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {employeeCount}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dayShifts.length}{" "}
                        {dayShifts.length === 1 ? "shift" : "shifts"}
                      </div>
                      {/* Status indicators */}
                      <div className="flex gap-1 mt-2 flex-wrap justify-center">
                        {Array.from(
                          new Set(dayShifts.map((s) => s.status))
                        ).map((status) => (
                          <div
                            key={status}
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              status
                            )}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Shift Details Dialog */}
      <Dialog
        open={selectedDate !== null}
        onOpenChange={() => setSelectedDate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              {groupedShifts.reduce((sum, g) => sum + g.employees.length, 0)}{" "}
              {groupedShifts.reduce((sum, g) => sum + g.employees.length, 0) ===
              1
                ? "employee"
                : "employees"}{" "}
              scheduled across {groupedShifts.length}{" "}
              {groupedShifts.length === 1 ? "shift" : "shift times"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {groupedShifts.map((group, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {group.time}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.employees.map((employee) => (
                    <Card key={employee.shiftId} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">
                                {employee.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {employee.email}
                              </p>
                            </div>
                            <Badge
                              className={`${getStatusColor(
                                employee.status
                              )}/10 text-xs shrink-0`}
                              style={{
                                color: getStatusColor(employee.status).replace(
                                  "bg-",
                                  ""
                                ),
                              }}
                            >
                              {employee.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            📍 {employee.location}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
