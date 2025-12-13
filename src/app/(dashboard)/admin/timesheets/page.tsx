"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShifts, useUpdateShift } from "@/hooks";
import { ShiftStatus } from "@/types/scheduling";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Coffee, Loader2 } from "lucide-react";
import { useState } from "react";

export default function TimesheetApprovalsPage() {
  const { data: allShifts, isLoading } = useShifts({
    all: true,
    status: ShiftStatus.COMPLETED,
  });
  const updateShift = useUpdateShift();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (shiftId: string) => {
    setProcessingId(shiftId);
    try {
      await updateShift.mutateAsync({
        id: shiftId,
        data: { approve: true },
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (shiftId: string) => {
    setProcessingId(shiftId);
    try {
      await updateShift.mutateAsync({
        id: shiftId,
        data: { approve: false },
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingShifts =
    allShifts?.filter((shift) => shift.status === ShiftStatus.COMPLETED) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheet Approvals</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve completed shifts
        </p>
      </div>

      {pendingShifts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              There are no pending timesheets to approve
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Breaks</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingShifts.map((shift) => {
                  const employee =
                    typeof shift.userId === "string"
                      ? shift.userId
                      : shift.userId?.firstName && shift.userId?.lastName
                      ? `${shift.userId.firstName} ${shift.userId.lastName}`
                      : shift.userId?.email || "Unknown";

                  const location =
                    typeof shift.locationId === "string"
                      ? shift.locationId
                      : shift.locationId?.name || "Unknown";

                  const workHours = (shift.totalMinutes || 0) / 60;
                  const varianceHours = (shift.varianceMinutes || 0) / 60;

                  return (
                    <TableRow key={shift._id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{employee}</p>
                          {typeof shift.userId !== "string" &&
                            shift.userId?.email && (
                              <p className="text-xs text-muted-foreground">
                                {shift.userId.email}
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>
                            {shift.actualStart
                              ? format(
                                  new Date(shift.actualStart),
                                  "MMM d, yyyy"
                                )
                              : "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {shift.actualStart
                              ? format(new Date(shift.actualStart), "EEEE")
                              : "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{location}</TableCell>
                      <TableCell>
                        {shift.actualStart
                          ? format(new Date(shift.actualStart), "h:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {shift.actualEnd
                          ? format(new Date(shift.actualEnd), "h:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coffee className="h-3 w-3 text-muted-foreground" />
                          <span>{shift.breakMinutes || 0} min</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {workHours.toFixed(2)} hrs
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            varianceHours > 0.5
                              ? "destructive"
                              : varianceHours < -0.5
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {varianceHours > 0 ? "+" : ""}
                          {varianceHours.toFixed(2)} hrs
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(shift._id)}
                            disabled={
                              processingId === shift._id ||
                              updateShift.isPending
                            }
                            className="gap-1"
                          >
                            {processingId === shift._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeny(shift._id)}
                            disabled={
                              processingId === shift._id ||
                              updateShift.isPending
                            }
                            className="gap-1"
                          >
                            {processingId === shift._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Variance shows difference from scheduled hours</span>
              </div>
            </div>
            <div>
              {pendingShifts.length} pending approval
              {pendingShifts.length !== 1 ? "s" : ""}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
