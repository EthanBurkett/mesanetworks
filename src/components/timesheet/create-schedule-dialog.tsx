"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Calendar } from "lucide-react";
import { useCreateSchedule } from "@/hooks";
import { usersApi, type UserResponse } from "@/lib/api/users";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Mock locations - should be fetched from API
const mockLocations = [
  { _id: "1", name: "Main Office" },
  { _id: "2", name: "Downtown Branch" },
  { _id: "3", name: "West Side Location" },
];

export function CreateScheduleDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    locationId: "",
    scheduledStart: "",
    scheduledEnd: "",
    notes: "",
    overrideAllowed: false,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
  });
  const createSchedule = useCreateSchedule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.userId ||
      !formData.locationId ||
      !formData.scheduledStart ||
      !formData.scheduledEnd
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSchedule.mutateAsync({
        userId: formData.userId,
        locationId: formData.locationId,
        scheduledStart: formData.scheduledStart,
        scheduledEnd: formData.scheduledEnd,
        notes: formData.notes || undefined,
        overrideAllowed: formData.overrideAllowed,
      });

      setOpen(false);
      setFormData({
        userId: "",
        locationId: "",
        scheduledStart: "",
        scheduledEnd: "",
        notes: "",
        overrideAllowed: false,
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Schedule
          </DialogTitle>
          <DialogDescription>
            Assign a shift to an employee. Fill in all the required information
            below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Employee Selection */}
            <div className="grid gap-2">
              <Label htmlFor="userId">
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.userId}
                onValueChange={(value) =>
                  setFormData({ ...formData, userId: value })
                }
              >
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading employees...
                    </div>
                  ) : (
                    users?.map((user: UserResponse) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.displayName} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div className="grid gap-2">
              <Label htmlFor="locationId">
                Location <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, locationId: value })
                }
              >
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {mockLocations.map((location) => (
                    <SelectItem key={location._id} value={location._id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduledStart">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scheduledStart"
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledStart: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledEnd">
                  End Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scheduledEnd"
                  type="datetime-local"
                  value={formData.scheduledEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledEnd: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes for this shift..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Override Allowed */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="overrideAllowed" className="text-base">
                  Allow Time Override
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permit clock in/out outside scheduled hours
                </p>
              </div>
              <Switch
                id="overrideAllowed"
                checked={formData.overrideAllowed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, overrideAllowed: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createSchedule.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
