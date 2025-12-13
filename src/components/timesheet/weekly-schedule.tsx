"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { useMyShifts } from "@/hooks";
import { ShiftStatus } from "@/types/scheduling";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

interface WeeklyScheduleProps {
  referenceDate?: Date;
}

export function WeeklySchedule({
  referenceDate = new Date(),
}: WeeklyScheduleProps) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sunday
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: shifts, isLoading } = useMyShifts();

  const getShiftForDay = (day: Date) => {
    return shifts?.find((shift) =>
      isSameDay(new Date(shift.scheduledStart), day)
    );
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.SCHEDULED:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case ShiftStatus.IN_PROGRESS:
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case ShiftStatus.COMPLETED:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case ShiftStatus.APPROVED:
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case ShiftStatus.CANCELLED:
        return "bg-red-500/10 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
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

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </h2>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map((day) => {
          const shift = getShiftForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isToday
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">
                      {format(day, "EEEE")}
                      {isToday && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Today
                        </Badge>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(day, "MMM d, yyyy")}
                  </p>
                </div>

                {shift ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {format(new Date(shift.scheduledStart), "h:mm a")} -{" "}
                          {format(new Date(shift.scheduledEnd), "h:mm a")}
                        </p>
                      </div>
                      {typeof shift.locationId === "object" && (
                        <div className="flex items-center gap-1 justify-end text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{shift.locationId.name}</span>
                        </div>
                      )}
                    </div>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status.replace("_", " ")}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline">No Shift</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
