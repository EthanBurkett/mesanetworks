"use client";

import { useState } from "react";
import { useActiveLocations, useUsers, useCreateSchedule } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Copy,
  Settings,
  Save,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { ManageLocationsDialog } from "@/components/timesheet";
import { addDays, format, startOfWeek } from "date-fns";

interface ScheduleEntry {
  id: string;
  userId: string;
  userName: string;
  locationId: string;
  locationName: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
  overrideAllowed: boolean;
}

export default function AdvancedScheduleCreatorPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState({
    locationId: "",
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
    overrideAllowed: false,
  });

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: locations = [], isLoading: locationsLoading } =
    useActiveLocations();
  const createSchedule = useCreateSchedule();

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.roles?.some((role) => role.name === roleFilter);

    return matchesSearch && matchesRole;
  });

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle all users
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  // Add schedule for selected users
  const addSchedulesForDate = (date: Date) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    if (!currentTemplate.locationId) {
      toast.error("Please select a location");
      return;
    }

    const newSchedules: ScheduleEntry[] = selectedUsers.map((userId) => {
      const user = users.find((u) => u._id === userId);
      const location = locations.find(
        (l) => l._id === currentTemplate.locationId
      );

      const startDateTime = new Date(date);
      const [startHour, startMinute] = currentTemplate.startTime.split(":");
      startDateTime.setHours(
        Number.parseInt(startHour),
        Number.parseInt(startMinute)
      );

      const endDateTime = new Date(date);
      const [endHour, endMinute] = currentTemplate.endTime.split(":");
      endDateTime.setHours(
        Number.parseInt(endHour),
        Number.parseInt(endMinute)
      );

      return {
        id: `${userId}-${date.toISOString()}-${Math.random()}`,
        userId,
        userName: user?.displayName || "Unknown",
        locationId: currentTemplate.locationId,
        locationName: location?.name || "Unknown",
        scheduledStart: startDateTime.toISOString(),
        scheduledEnd: endDateTime.toISOString(),
        notes: currentTemplate.notes,
        overrideAllowed: currentTemplate.overrideAllowed,
      };
    });

    setSchedules((prev) => [...prev, ...newSchedules]);
    toast.success(`Added ${newSchedules.length} schedule(s)`);
  };

  // Bulk add for week
  const addSchedulesForWeek = (startDate: Date) => {
    const weekDays = [0, 1, 2, 3, 4]; // Monday to Friday
    weekDays.forEach((dayOffset) => {
      const date = addDays(startDate, dayOffset);
      addSchedulesForDate(date);
    });
  };

  // Remove schedule
  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Duplicate schedule
  const duplicateSchedule = (schedule: ScheduleEntry) => {
    const newSchedule = {
      ...schedule,
      id: `${schedule.userId}-${new Date().toISOString()}-${Math.random()}`,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    toast.success("Schedule duplicated");
  };

  // Submit all schedules
  const submitAllSchedules = async () => {
    if (schedules.length === 0) {
      toast.error("No schedules to create");
      return;
    }

    toast.promise(
      Promise.all(
        schedules.map((schedule) =>
          createSchedule.mutateAsync({
            userId: schedule.userId,
            locationId: schedule.locationId,
            scheduledStart: schedule.scheduledStart,
            scheduledEnd: schedule.scheduledEnd,
            notes: schedule.notes,
            overrideAllowed: schedule.overrideAllowed,
          })
        )
      ),
      {
        loading: `Creating ${schedules.length} schedule(s)...`,
        success: () => {
          setSchedules([]);
          setSelectedUsers([]);
          return `Successfully created ${schedules.length} schedule(s)`;
        },
        error: "Failed to create some schedules",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Schedule Creator
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage employee schedules efficiently
          </p>
        </div>
        <ManageLocationsDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Selection */}
        <Card className="p-6 border-2 lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Employees
              </h2>
              <Badge variant="secondary">{selectedUsers.length} selected</Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="EMPLOYEE">Employees</SelectItem>
                <SelectItem value="MANAGER">Managers</SelectItem>
              </SelectContent>
            </Select>

            {/* Select All */}
            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox
                checked={
                  selectedUsers.length === filteredUsers.length &&
                  filteredUsers.length > 0
                }
                onCheckedChange={toggleAllUsers}
              />
              <Label className="text-sm font-medium cursor-pointer">
                Select All ({filteredUsers.length})
              </Label>
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No employees found
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleUser(user._id)}
                  >
                    <Checkbox checked={selectedUsers.includes(user._id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.roles && user.roles.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {user.roles[0].name}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Right Column: Schedule Template & Actions */}
        <Card className="p-6 border-2 lg:col-span-2">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Schedule Template
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </Label>
                <Select
                  value={currentTemplate.locationId}
                  onValueChange={(value) =>
                    setCurrentTemplate((prev) => ({
                      ...prev,
                      locationId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : locations.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No active locations
                      </div>
                    ) : (
                      locations.map((location) => (
                        <SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time *
                </Label>
                <Input
                  type="time"
                  value={currentTemplate.startTime}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time *
                </Label>
                <Input
                  type="time"
                  value={currentTemplate.endTime}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Override Allowed */}
              <div className="space-y-2">
                <Label>Flexible Clock In/Out</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currentTemplate.overrideAllowed}
                    onCheckedChange={(checked) =>
                      setCurrentTemplate((prev) => ({
                        ...prev,
                        overrideAllowed: checked,
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Allow early/late clock
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add any notes or instructions..."
                value={currentTemplate.notes}
                onChange={(e) =>
                  setCurrentTemplate((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Label className="font-semibold">Quick Add</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => addSchedulesForDate(new Date())}
                  variant="outline"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add Today
                </Button>
                <Button
                  onClick={() => addSchedulesForDate(addDays(new Date(), 1))}
                  variant="outline"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add Tomorrow
                </Button>
                <Button
                  onClick={() =>
                    addSchedulesForWeek(
                      startOfWeek(new Date(), { weekStartsOn: 1 })
                    )
                  }
                  variant="outline"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add This Week
                </Button>
                <Button
                  onClick={() =>
                    addSchedulesForWeek(
                      startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 })
                    )
                  }
                  variant="outline"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Add Next Week
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Scheduled Items Table */}
      <Card className="border-2">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Pending Schedules ({schedules.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and submit schedules
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSchedules([])}
                disabled={schedules.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={submitAllSchedules}
                disabled={schedules.length === 0 || createSchedule.isPending}
                className="gap-2"
              >
                {createSchedule.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create {schedules.length} Schedule
                {schedules.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No schedules added yet</p>
            <p className="text-sm mt-1">
              Select employees and use Quick Add buttons to create schedules
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const start = new Date(schedule.scheduledStart);
                  const end = new Date(schedule.scheduledEnd);
                  const duration =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.userName}
                      </TableCell>
                      <TableCell>{schedule.locationName}</TableCell>
                      <TableCell>{format(start, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {format(start, "h:mm a")} - {format(end, "h:mm a")}
                      </TableCell>
                      <TableCell>{duration.toFixed(1)} hrs</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {schedule.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => duplicateSchedule(schedule)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
