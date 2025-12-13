"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { useSchedules, useUpdateSchedule, useDeleteSchedule } from "@/hooks";
import { ShiftStatus } from "@/types/scheduling";
import { format } from "date-fns";

export function ScheduleManagementTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: schedules, isLoading } = useSchedules(
    statusFilter !== "all" ? { status: statusFilter as ShiftStatus } : undefined
  );
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const handleApprove = async (id: string) => {
    await updateSchedule.mutateAsync({
      id,
      data: { approve: true },
    });
  };

  const handleCancel = async (id: string) => {
    await updateSchedule.mutateAsync({
      id,
      data: { approve: false },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule.mutateAsync(id);
    }
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

  // Filter schedules by search query
  const filteredSchedules = schedules?.filter((schedule) => {
    if (!searchQuery) return true;
    const employeeName =
      typeof schedule.userId === "object"
        ? schedule.userId.displayName.toLowerCase()
        : "";
    const locationName =
      typeof schedule.locationId === "object"
        ? schedule.locationId.name.toLowerCase()
        : "";
    return (
      employeeName.includes(searchQuery.toLowerCase()) ||
      locationName.includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Schedule Management</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ShiftStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={ShiftStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={ShiftStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={ShiftStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={ShiftStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules && filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => {
                const start = new Date(schedule.scheduledStart);
                const end = new Date(schedule.scheduledEnd);
                const durationHours =
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                return (
                  <TableRow key={schedule._id}>
                    <TableCell className="font-medium">
                      {typeof schedule.userId === "object" ? (
                        <div>
                          <p>{schedule.userId.displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.userId.email}
                          </p>
                        </div>
                      ) : (
                        schedule.userId
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof schedule.locationId === "object"
                        ? schedule.locationId.name
                        : schedule.locationId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{format(start, "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(start, "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{format(end, "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(end, "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{durationHours.toFixed(1)} hrs</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {schedule.status === ShiftStatus.COMPLETED && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(schedule._id)}
                                disabled={updateSchedule.isPending}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancel(schedule._id)}
                                disabled={updateSchedule.isPending}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Cancel
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {schedule.status === ShiftStatus.SCHEDULED && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(schedule._id)}
                                disabled={deleteSchedule.isPending}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No schedules found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
