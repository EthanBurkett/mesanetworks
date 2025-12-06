"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  TrendingUp,
  Coffee,
  PlayCircle,
  PauseCircle,
  StopCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/hooks";

// Mock data - will be replaced with real data later
const mockSchedule = [
  { day: "Monday", start: "09:00 AM", end: "05:00 PM", hours: 8 },
  { day: "Tuesday", start: "09:00 AM", end: "05:00 PM", hours: 8 },
  { day: "Wednesday", start: "09:00 AM", end: "05:00 PM", hours: 8 },
  { day: "Thursday", start: "09:00 AM", end: "05:00 PM", hours: 8 },
  { day: "Friday", start: "09:00 AM", end: "05:00 PM", hours: 8 },
];

const mockRecentActivity = [
  {
    date: "2025-12-05",
    clockIn: "08:55 AM",
    clockOut: "05:10 PM",
    breaks: "45 min",
    total: "7.75 hrs",
  },
  {
    date: "2025-12-04",
    clockIn: "09:02 AM",
    clockOut: "05:05 PM",
    breaks: "30 min",
    total: "7.55 hrs",
  },
  {
    date: "2025-12-03",
    clockIn: "08:58 AM",
    clockOut: "05:15 PM",
    breaks: "40 min",
    total: "7.72 hrs",
  },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [clockStatus, setClockStatus] = useState<
    "clocked-out" | "clocked-in" | "on-break"
  >("clocked-out");
  const [currentTime, setCurrentTime] = useState("00:00:00");

  const stats = [
    {
      title: "This Week",
      value: "38.5 hrs",
      subtitle: "Regular Hours",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Overtime",
      value: "2.5 hrs",
      subtitle: "This Period",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Scheduled",
      value: "40 hrs",
      subtitle: "This Week",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Break Time",
      value: "45 min",
      subtitle: "Remaining Today",
      icon: Coffee,
      color: "from-orange-500 to-amber-500",
    },
  ];

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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your time and manage your schedule
        </p>
      </div>

      {/* Clock In/Out Card */}
      <Card className="p-6 border-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Schedule and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Schedule */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">This Week's Schedule</h2>
          </div>
          <div className="space-y-3">
            {mockSchedule.map((schedule, index) => (
              <div
                key={schedule.day}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  index === new Date().getDay() - 1
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      index === new Date().getDay() - 1
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      index === new Date().getDay() - 1
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {schedule.day}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {schedule.start} - {schedule.end}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {schedule.hours} hours
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Total Scheduled: <span className="font-semibold">40 hours</span>
            </p>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.date}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{activity.date}</p>
                  <Badge variant="outline">{activity.total}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Clock In</p>
                    <p className="font-medium">{activity.clockIn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Clock Out</p>
                    <p className="font-medium">{activity.clockOut}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Breaks</p>
                    <p className="font-medium">{activity.breaks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Full History
          </Button>
        </Card>
      </div>

      {/* Upcoming Features Placeholder */}
      <Card className="p-6 border-2 border-dashed">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">
            More Features Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Detailed timesheet reports, overtime tracking, PTO requests, and
            more will be available here
          </p>
        </div>
      </Card>
    </div>
  );
}
