"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { TimeClockCard } from "@/components/timesheet/time-clock-card";
import { TimesheetStats } from "@/components/timesheet/timesheet-stats";
import { WeeklySchedule } from "@/components/timesheet/weekly-schedule";
import { RecentActivity } from "@/components/timesheet/recent-activity";
import { CalendarView } from "@/components/timesheet/calendar-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addWeeks } from "date-fns";

type ScheduleView = "this-week" | "next-week" | "calendar";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [scheduleView, setScheduleView] = useState<ScheduleView>("this-week");

  const getDateRange = () => {
    const now = new Date();
    if (scheduleView === "next-week") {
      return addWeeks(now, 1);
    }
    return now;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your time and manage your schedule
          </p>
        </div>
        <div className="w-[200px]">
          <Select
            value={scheduleView}
            onValueChange={(value) => setScheduleView(value as ScheduleView)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
              <SelectItem value="calendar">Whole Calendar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Clock */}
      <TimeClockCard />

      {/* Stats */}
      <TimesheetStats />

      {/* Schedule View */}
      {scheduleView === "calendar" ? (
        <CalendarView />
      ) : (
        <WeeklySchedule referenceDate={getDateRange()} />
      )}

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
