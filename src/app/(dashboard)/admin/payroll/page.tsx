"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ShiftStatus } from "@/types/scheduling";

export default function PayrollExportPage() {
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [status, setStatus] = useState<ShiftStatus>(ShiftStatus.APPROVED);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        status,
      });

      const response = await fetch(
        `/api/v1/timesheets/payroll/export?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export payroll data");
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        `payroll_${startDate}_to_${endDate}.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export payroll data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const setQuickRange = (range: "current" | "last" | "lastTwo") => {
    const now = new Date();
    switch (range) {
      case "current":
        setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
        break;
      case "last":
        const lastMonth = subMonths(now, 1);
        setStartDate(format(startOfMonth(lastMonth), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(lastMonth), "yyyy-MM-dd"));
        break;
      case "lastTwo":
        const twoMonthsAgo = subMonths(now, 1);
        setStartDate(format(startOfMonth(twoMonthsAgo), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Export</h1>
        <p className="text-muted-foreground mt-2">
          Export timesheet data for payroll processing
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Export Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setQuickRange("current")}
                className="justify-start"
              >
                Current Month
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickRange("last")}
                className="justify-start"
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickRange("lastTwo")}
                className="justify-start"
              >
                Last 2 Months
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Shift Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ShiftStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ShiftStatus.APPROVED}>
                  Approved Only
                </SelectItem>
                <SelectItem value={ShiftStatus.COMPLETED}>
                  Completed (Pending Approval)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Typically, only approved shifts should be included in payroll
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleExport}
              disabled={isExporting || !startDate || !endDate}
              size="lg"
              className="w-full md:w-auto gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Export to CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">CSV Export Includes:</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Employee information (ID, name, email)</li>
          <li>• Shift dates and times (scheduled and actual)</li>
          <li>• Work hours breakdown (regular, overtime, gross)</li>
          <li>• Break time deductions</li>
          <li>• Variance from scheduled hours</li>
          <li>• Approval information (approver, timestamp)</li>
          <li>• Location and notes</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          <strong>Note:</strong> Regular hours are capped at 8 hours per shift.
          Hours beyond 8 are counted as overtime.
        </p>
      </Card>
    </div>
  );
}
