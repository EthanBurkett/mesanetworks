"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  PlayCircle,
  PauseCircle,
  StopCircle,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCreatePunch, useMyShifts, useShiftPunches } from "@/hooks";
import { PunchType, ShiftStatus } from "@/types/scheduling";
import { format, formatDuration, intervalToDuration } from "date-fns";

export function TimeClockCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  // Get in-progress shifts
  const { data: inProgressShifts, isLoading: inProgressLoading } = useMyShifts(
    ShiftStatus.IN_PROGRESS
  );

  // Get scheduled shifts (for clock-in)
  const { data: scheduledShifts, isLoading: scheduledLoading } = useMyShifts(
    ShiftStatus.SCHEDULED
  );

  // Find the current or next scheduled shift based on time
  const now = new Date();
  const currentOrNextScheduledShift =
    scheduledShifts?.find((shift) => {
      const shiftStart = new Date(shift.scheduledStart);
      const shiftEnd = new Date(shift.scheduledEnd);
      // Include shifts that are happening now or starting soon (within next 4 hours)
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      return shiftStart <= fourHoursFromNow && shiftEnd >= now;
    }) || scheduledShifts?.[0]; // Fallback to first if none found

  // Active shift is either in-progress or the current/next scheduled shift
  const activeShift = inProgressShifts?.[0] || currentOrNextScheduledShift;
  const isScheduledShift =
    !inProgressShifts?.[0] && !!currentOrNextScheduledShift;

  const { data: punches, isLoading: punchesLoading } = useShiftPunches(
    activeShift?._id || ""
  );

  const createPunch = useCreatePunch();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        () => {
          // Location is optional, so we just continue without it
          // User may have denied permission or it may be unavailable
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  // Calculate break time used and remaining
  const getBreakTimeInfo = () => {
    if (!punches || punches.length === 0) {
      return { usedMinutes: 0, remainingMinutes: 60 };
    }

    let totalBreakMinutes = 0;
    for (let i = 0; i < punches.length; i++) {
      if (
        punches[i].type === PunchType.BREAK_START &&
        punches[i + 1]?.type === PunchType.BREAK_END
      ) {
        const breakStart = new Date(punches[i].timestamp);
        const breakEnd = new Date(punches[i + 1].timestamp);
        totalBreakMinutes +=
          (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      }
    }

    // If currently on break, add current break time
    const lastPunch = punches[punches.length - 1];
    if (lastPunch?.type === PunchType.BREAK_START) {
      const breakStart = new Date(lastPunch.timestamp);
      const now = new Date();
      totalBreakMinutes += (now.getTime() - breakStart.getTime()) / (1000 * 60);
    }

    const remainingMinutes = Math.max(60 - totalBreakMinutes, 0);
    return { usedMinutes: totalBreakMinutes, remainingMinutes };
  };

  const breakTimeInfo = getBreakTimeInfo();

  // Calculate elapsed time
  useEffect(() => {
    if (!punches || punches.length === 0) {
      setElapsedTime("00:00:00");
      return;
    }

    const clockInPunch = punches.find((p) => p.type === PunchType.CLOCK_IN);
    if (!clockInPunch) {
      setElapsedTime("00:00:00");
      return;
    }

    const timer = setInterval(() => {
      const startTime = new Date(clockInPunch.timestamp);
      const now = new Date();

      // Calculate break time
      let totalBreakMinutes = 0;
      for (let i = 0; i < punches.length; i++) {
        if (
          punches[i].type === PunchType.BREAK_START &&
          punches[i + 1]?.type === PunchType.BREAK_END
        ) {
          const breakStart = new Date(punches[i].timestamp);
          const breakEnd = new Date(punches[i + 1].timestamp);
          totalBreakMinutes +=
            (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
        }
      }

      // Check if currently on break
      const lastPunch = punches[punches.length - 1];
      let currentBreakTime = 0;
      if (lastPunch.type === PunchType.BREAK_START) {
        const breakStart = new Date(lastPunch.timestamp);
        currentBreakTime = (now.getTime() - breakStart.getTime()) / (1000 * 60);
      }

      const totalMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
      const workMinutes = totalMinutes - totalBreakMinutes - currentBreakTime;

      const duration = intervalToDuration({
        start: 0,
        end: workMinutes * 60 * 1000,
      });
      const formatted = `${String(duration.hours || 0).padStart(
        2,
        "0"
      )}:${String(duration.minutes || 0).padStart(2, "0")}:${String(
        duration.seconds || 0
      ).padStart(2, "0")}`;

      setElapsedTime(formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, [punches]);

  const getClockStatus = () => {
    if (!punches || punches.length === 0) return "clocked-out";

    const lastPunch = punches[punches.length - 1];
    if (lastPunch.type === PunchType.CLOCK_OUT) return "clocked-out";
    if (lastPunch.type === PunchType.BREAK_START) return "on-break";
    return "clocked-in";
  };

  const clockStatus = getClockStatus();

  const handleClockIn = async () => {
    if (!activeShift) return;

    await createPunch.mutateAsync({
      shiftId: activeShift._id,
      locationId:
        typeof activeShift.locationId === "string"
          ? activeShift.locationId
          : activeShift.locationId._id,
      type: PunchType.CLOCK_IN,
      geolocation: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : undefined,
    });
  };

  const handleClockOut = async () => {
    if (!activeShift) return;

    await createPunch.mutateAsync({
      shiftId: activeShift._id,
      locationId:
        typeof activeShift.locationId === "string"
          ? activeShift.locationId
          : activeShift.locationId._id,
      type: PunchType.CLOCK_OUT,
      geolocation: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : undefined,
    });
  };

  const handleBreak = async () => {
    if (!activeShift) return;

    const type =
      clockStatus === "on-break" ? PunchType.BREAK_END : PunchType.BREAK_START;

    await createPunch.mutateAsync({
      shiftId: activeShift._id,
      locationId:
        typeof activeShift.locationId === "string"
          ? activeShift.locationId
          : activeShift.locationId._id,
      type,
      geolocation: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : undefined,
    });
  };

  const isLoading =
    inProgressLoading ||
    scheduledLoading ||
    punchesLoading ||
    createPunch.isPending;

  const clockInPunch = punches?.find((p) => p.type === PunchType.CLOCK_IN);

  return (
    <Card className="p-6 border-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Time Clock</h2>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="text-4xl font-bold font-mono tabular-nums">
              {clockStatus === "clocked-in" || clockStatus === "on-break"
                ? elapsedTime
                : format(currentTime, "HH:mm:ss")}
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
          {clockInPunch && clockStatus !== "clocked-out" && (
            <p className="text-sm text-muted-foreground mt-2">
              Started at {format(new Date(clockInPunch.timestamp), "h:mm a")}
            </p>
          )}
          {location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Location tracking enabled
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!activeShift ? (
            <div className="text-center p-4 text-sm text-muted-foreground">
              No active shift scheduled
            </div>
          ) : clockStatus === "clocked-out" ? (
            <>
              {isScheduledShift && activeShift && (
                <div className="text-sm text-muted-foreground mb-2 text-center sm:text-right">
                  <p>
                    Scheduled:{" "}
                    {format(new Date(activeShift.scheduledStart), "h:mm a")} -{" "}
                    {format(new Date(activeShift.scheduledEnd), "h:mm a")}
                  </p>
                  {typeof activeShift.locationId === "object" && (
                    <p className="flex items-center gap-1 justify-center sm:justify-end mt-1">
                      <MapPin className="h-3 w-3" />
                      {activeShift.locationId.name}
                    </p>
                  )}
                </div>
              )}
              <Button
                size="lg"
                onClick={handleClockIn}
                disabled={isLoading}
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}
                Clock In
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                variant={clockStatus === "on-break" ? "default" : "outline"}
                onClick={handleBreak}
                disabled={
                  isLoading ||
                  (clockStatus !== "on-break" &&
                    breakTimeInfo.remainingMinutes <= 0)
                }
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : clockStatus === "on-break" ? (
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
                disabled={isLoading || clockStatus === "on-break"}
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <StopCircle className="h-5 w-5" />
                )}
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

      {clockStatus === "clocked-in" && breakTimeInfo.remainingMinutes <= 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              No break time remaining
            </p>
            <p className="text-sm text-red-800 dark:text-red-200 mt-0.5">
              You have used all your break time for today (60 minutes)
            </p>
          </div>
        </div>
      )}

      {clockStatus === "clocked-in" &&
        breakTimeInfo.remainingMinutes > 0 &&
        breakTimeInfo.remainingMinutes <= 15 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Low break time remaining
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-0.5">
                You have {Math.floor(breakTimeInfo.remainingMinutes)} minutes of
                break time left today
              </p>
            </div>
          </div>
        )}
    </Card>
  );
}
