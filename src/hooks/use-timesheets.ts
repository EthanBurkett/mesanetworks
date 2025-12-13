import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  timesheetsApi,
  type CreateScheduleRequest,
  type UpdateScheduleRequest,
  type ApproveShiftRequest,
  type CreatePunchRequest,
  type UpdatePunchNotesRequest,
  type SchedulesQueryParams,
  type ShiftsQueryParams,
  type PunchesQueryParams,
} from "@/lib/api/timesheets";
import { toast } from "sonner";

// Schedule hooks (Manager)
export function useSchedules(params?: SchedulesQueryParams) {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => timesheetsApi.getSchedules(params),
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => timesheetsApi.getSchedule(id),
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) =>
      timesheetsApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Schedule created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create schedule");
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleRequest | ApproveShiftRequest;
    }) => timesheetsApi.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", variables.id] });

      if ("approve" in variables.data) {
        toast.success(
          variables.data.approve
            ? "Shift approved successfully"
            : "Shift cancelled successfully"
        );
      } else {
        toast.success("Schedule updated successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timesheetsApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Schedule deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete schedule");
    },
  });
}

// Shift hooks (Employee)
export function useShifts(params?: ShiftsQueryParams) {
  return useQuery({
    queryKey: ["shifts", params],
    queryFn: () => timesheetsApi.getShifts(params),
  });
}

export function useShift(id: string) {
  return useQuery({
    queryKey: ["shifts", id],
    queryFn: () => timesheetsApi.getShift(id),
    enabled: !!id,
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleRequest | ApproveShiftRequest;
    }) => timesheetsApi.updateShift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shifts", variables.id] });

      if ("approve" in variables.data) {
        toast.success(
          variables.data.approve
            ? "Shift approved successfully"
            : "Shift cancelled successfully"
        );
      } else {
        toast.success("Shift updated successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shift");
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timesheetsApi.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shift");
    },
  });
}

// Punch hooks (Time clock)
export function usePunches(params?: PunchesQueryParams) {
  return useQuery({
    queryKey: ["punches", params],
    queryFn: () => timesheetsApi.getPunches(params),
  });
}

export function usePunch(id: string) {
  return useQuery({
    queryKey: ["punches", id],
    queryFn: () => timesheetsApi.getPunch(id),
    enabled: !!id,
  });
}

export function useCreatePunch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePunchRequest) => timesheetsApi.createPunch(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });

      // Show appropriate message based on punch type
      const messages = {
        CLOCK_IN: "Clocked in successfully",
        CLOCK_OUT: "Clocked out successfully",
        BREAK_START: "Break started",
        BREAK_END: "Break ended",
      };
      toast.success(messages[data.type] || "Punch recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record punch");
    },
  });
}

export function useUpdatePunchNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePunchNotesRequest }) =>
      timesheetsApi.updatePunchNotes(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["punches", variables.id] });
      toast.success("Punch notes updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update punch notes");
    },
  });
}

export function useDeletePunch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timesheetsApi.deletePunch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Punch deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete punch");
    },
  });
}

// Convenience hooks for common use cases
export function useMyShifts(status?: string) {
  return useShifts({ status: status as any });
}

export function useMyPunches(shiftId?: string) {
  return usePunches(shiftId ? { shiftId } : undefined);
}

export function useShiftPunches(shiftId: string) {
  return useQuery({
    queryKey: ["punches", { shiftId }],
    queryFn: () => timesheetsApi.getPunches({ shiftId }),
    enabled: !!shiftId,
  });
}
