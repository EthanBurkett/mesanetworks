"use client";

import { Card } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp, Coffee } from "lucide-react";
import { useMyShifts, useMyPunches } from "@/hooks";
import { ShiftStatus, PunchType } from "@/types/scheduling";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card className="p-4 border-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

export function TimesheetStats() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  const { data: shifts } = useMyShifts();
  const { data: allPunches } = useMyPunches();

  // Filter this week's data
  const thisWeekShifts =
    shifts?.filter((shift) =>
      isWithinInterval(new Date(shift.scheduledStart), {
        start: weekStart,
        end: weekEnd,
      })
    ) || [];

  const thisWeekPunches =
    allPunches?.filter((punch) =>
      isWithinInterval(new Date(punch.timestamp), {
        start: weekStart,
        end: weekEnd,
      })
    ) || [];

  // Calculate total regular hours this week
  const totalRegularHours = thisWeekShifts
    .filter(
      (s) =>
        s.status === ShiftStatus.COMPLETED ||
        s.status === ShiftStatus.APPROVED ||
        s.status === ShiftStatus.IN_PROGRESS
    )
    .reduce((sum, shift) => {
      // Use totalMinutes from shift if available (for completed/approved shifts)
      if (shift.totalMinutes !== undefined && shift.totalMinutes !== null) {
        const hours = shift.totalMinutes / 60;
        return sum + Math.min(hours, 8); // Cap at 8 hours per day for regular
      }

      // Fallback: calculate for in-progress shifts
      if (shift.actualStart) {
        const start = new Date(shift.actualStart);
        const end = shift.actualEnd ? new Date(shift.actualEnd) : new Date();
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const breakHours = (shift.breakMinutes || 0) / 60;
        const workHours = Math.max(hours - breakHours, 0);
        return sum + Math.min(workHours, 8);
      }
      return sum;
    }, 0);

  // Calculate overtime hours
  const totalOvertimeHours = thisWeekShifts
    .filter(
      (s) =>
        s.status === ShiftStatus.COMPLETED ||
        s.status === ShiftStatus.APPROVED ||
        s.status === ShiftStatus.IN_PROGRESS
    )
    .reduce((sum, shift) => {
      // Use totalMinutes from shift if available (for completed/approved shifts)
      if (shift.totalMinutes !== undefined && shift.totalMinutes !== null) {
        const hours = shift.totalMinutes / 60;
        return sum + Math.max(hours - 8, 0); // Anything over 8 hours
      }

      // Fallback: calculate for in-progress shifts
      if (shift.actualStart) {
        const start = new Date(shift.actualStart);
        const end = shift.actualEnd ? new Date(shift.actualEnd) : new Date();
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const breakHours = (shift.breakMinutes || 0) / 60;
        const totalHours = Math.max(hours - breakHours, 0);
        return sum + Math.max(totalHours - 8, 0);
      }
      return sum;
    }, 0);

  // Calculate scheduled hours this week
  const scheduledHours = thisWeekShifts.reduce((sum, shift) => {
    const start = new Date(shift.scheduledStart);
    const end = new Date(shift.scheduledEnd);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  // Calculate total break time today
  const todayPunches = thisWeekPunches.filter((punch) => {
    const punchDate = new Date(punch.timestamp);
    return (
      punchDate.getDate() === now.getDate() &&
      punchDate.getMonth() === now.getMonth() &&
      punchDate.getFullYear() === now.getFullYear()
    );
  });

  let totalBreakMinutes = 0;
  for (let i = 0; i < todayPunches.length; i++) {
    if (
      todayPunches[i].type === PunchType.BREAK_START &&
      todayPunches[i + 1]?.type === PunchType.BREAK_END
    ) {
      const start = new Date(todayPunches[i].timestamp);
      const end = new Date(todayPunches[i + 1].timestamp);
      totalBreakMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    }
  }

  // Assuming 60 min total break allowed per day
  const remainingBreakMinutes = Math.max(60 - totalBreakMinutes, 0);

  const stats = [
    {
      title: "This Week",
      value: `${totalRegularHours.toFixed(1)} hrs`,
      subtitle: "Regular Hours",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Overtime",
      value: `${totalOvertimeHours.toFixed(1)} hrs`,
      subtitle: "This Week",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Scheduled",
      value: `${scheduledHours.toFixed(1)} hrs`,
      subtitle: "This Week",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Break Time",
      value: `${remainingBreakMinutes} min`,
      subtitle: "Remaining Today",
      icon: Coffee,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
