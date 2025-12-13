"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyShifts } from "@/hooks";
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
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: shifts, isLoading } = useMyShifts();

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
      shifts?.filter((shift) =>
        isSameDay(new Date(shift.scheduledStart), day)
      ) || []
    );
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      case ShiftStatus.IN_PROGRESS:
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20";
      case ShiftStatus.COMPLETED:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
      case ShiftStatus.APPROVED:
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case ShiftStatus.CANCELLED:
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
    }
  };

  const selectedDayShifts = selectedDate ? getShiftsForDay(selectedDate) : [];

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

            return (
              <button
                type="button"
                key={day.toISOString()}
                onClick={() => hasShifts && setSelectedDate(day)}
                className={`
                  min-h-[100px] p-2 rounded-lg border-2 transition-all
                  ${!isCurrentMonth && "opacity-40"}
                  ${isToday && "border-primary bg-primary/5"}
                  ${!isToday && "border-border"}
                  ${hasShifts && "hover:border-primary/50 cursor-pointer"}
                  ${!hasShifts && "cursor-default"}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className="text-left">
                    <span
                      className={`text-sm font-medium ${
                        isToday && "text-primary"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="flex-1 mt-1 space-y-1">
                    {dayShifts.slice(0, 2).map((shift, idx) => (
                      <div
                        key={shift._id}
                        className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(
                          shift.status
                        )}`}
                      >
                        <div className="truncate">
                          {format(new Date(shift.scheduledStart), "h:mm a")}
                        </div>
                      </div>
                    ))}
                    {dayShifts.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1.5">
                        +{dayShifts.length - 2} more
                      </div>
                    )}
                  </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              {selectedDayShifts.length === 1
                ? "1 shift scheduled"
                : `${selectedDayShifts.length} shifts scheduled`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDayShifts.map((shift) => (
              <Card key={shift._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">
                      {format(new Date(shift.scheduledStart), "h:mm a")} -{" "}
                      {format(new Date(shift.scheduledEnd), "h:mm a")}
                    </p>
                  </div>
                  <Badge className={getStatusColor(shift.status)}>
                    {shift.status.replace("_", " ")}
                  </Badge>
                </div>

                {typeof shift.locationId === "object" && shift.locationId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{shift.locationId.name}</span>
                    {shift.locationId.city && shift.locationId.state && (
                      <span className="text-xs">
                        • {shift.locationId.city}, {shift.locationId.state}
                      </span>
                    )}
                  </div>
                )}

                {shift.notes && (
                  <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                    {shift.notes}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
