"use client";

import { CreateScheduleDialog } from "@/components/timesheet/create-schedule-dialog";
import { ScheduleCalendarView } from "@/components/timesheet/schedule-calendar-view";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { useSchedules } from "@/hooks";
import { ShiftStatus } from "@/types/scheduling";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ManagerSchedulesPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const router = useRouter();

  const { data: allSchedules } = useSchedules();

  // Calculate stats
  const thisWeekSchedules =
    allSchedules?.filter((schedule) =>
      isWithinInterval(new Date(schedule.scheduledStart), {
        start: weekStart,
        end: weekEnd,
      })
    ) || [];

  const activeSchedules =
    allSchedules?.filter(
      (s) =>
        s.status === ShiftStatus.SCHEDULED ||
        s.status === ShiftStatus.IN_PROGRESS
    ).length || 0;

  const pendingApproval =
    allSchedules?.filter((s) => s.status === ShiftStatus.COMPLETED).length || 0;

  const totalHours = thisWeekSchedules.reduce((sum, schedule) => {
    const start = new Date(schedule.scheduledStart);
    const end = new Date(schedule.scheduledEnd);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const stats = [
    {
      title: "Active Schedules",
      value: activeSchedules,
      subtitle: "Currently active",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "This Week",
      value: `${thisWeekSchedules.length} shifts`,
      subtitle: `${totalHours.toFixed(0)} total hours`,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      subtitle: "Completed shifts",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Employees",
      value: new Set(
        thisWeekSchedules.map((s) =>
          typeof s.userId === "string" ? s.userId : s.userId._id
        )
      ).size,
      subtitle: "Scheduled this week",
      icon: Users,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage employee schedules
          </p>
        </div>

        <Button onClick={() => router.push("/manager/schedules/create")}>
          Create Schedule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Calendar */}
      <ScheduleCalendarView />
    </div>
  );
}
