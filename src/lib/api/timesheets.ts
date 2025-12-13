import { ApiResponse } from "@/lib/api-utils";
import { PunchType, ShiftStatus } from "@/types/scheduling";

const API_BASE = "/api/v1/timesheets";

// Response types
export interface LocationResponse {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftResponse {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        displayName: string;
      };
  managerId:
    | string
    | {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        displayName: string;
      };
  locationId: string | LocationResponse;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  totalMinutes: number;
  breakMinutes: number;
  varianceMinutes: number;
  status: ShiftStatus;
  notes?: string;
  overrideAllowed: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PunchResponse {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        displayName: string;
      };
  shiftId: string | ShiftResponse;
  locationId: string | LocationResponse;
  type: PunchType;
  timestamp: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  ipAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateScheduleRequest {
  userId: string;
  locationId: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
  overrideAllowed?: boolean;
}

export interface UpdateScheduleRequest {
  userId?: string;
  locationId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string;
  overrideAllowed?: boolean;
}

export interface ApproveShiftRequest {
  approve: boolean;
}

export interface CreatePunchRequest {
  shiftId: string;
  locationId: string;
  type: PunchType;
  timestamp?: string;
  notes?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdatePunchNotesRequest {
  notes: string;
}

// Query parameters
export interface SchedulesQueryParams {
  userId?: string;
  locationId?: string;
  status?: ShiftStatus;
  startDate?: string;
  endDate?: string;
}

export interface ShiftsQueryParams {
  all?: boolean;
  status?: ShiftStatus;
}

export interface PunchesQueryParams {
  all?: boolean;
  shiftId?: string;
  startDate?: string;
  endDate?: string;
}

export const timesheetsApi = {
  // Schedules (Manager endpoints)
  getSchedules: async (
    params?: SchedulesQueryParams
  ): Promise<ShiftResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.locationId) searchParams.set("locationId", params.locationId);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    const url = `${API_BASE}/schedules${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    const res = await fetch(url, { credentials: "include" });
    const json: ApiResponse<ShiftResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch schedules");
    }

    return json.data;
  },

  getSchedule: async (id: string): Promise<ShiftResponse> => {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      credentials: "include",
    });
    const json: ApiResponse<ShiftResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch schedule");
    }

    return json.data;
  },

  createSchedule: async (
    data: CreateScheduleRequest
  ): Promise<ShiftResponse> => {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<ShiftResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to create schedule");
    }

    return json.data;
  },

  updateSchedule: async (
    id: string,
    data: UpdateScheduleRequest | ApproveShiftRequest
  ): Promise<ShiftResponse> => {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<ShiftResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update schedule");
    }

    return json.data;
  },

  deleteSchedule: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to delete schedule");
    }

    return json.data;
  },

  // Shifts (Employee endpoints)
  getShifts: async (params?: ShiftsQueryParams): Promise<ShiftResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.all) searchParams.set("all", "true");
    if (params?.status) searchParams.set("status", params.status);

    const url = `${API_BASE}/shifts${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    const res = await fetch(url, { credentials: "include" });
    const json: ApiResponse<ShiftResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch shifts");
    }

    return json.data;
  },

  getShift: async (id: string): Promise<ShiftResponse> => {
    const res = await fetch(`${API_BASE}/shifts/${id}`, {
      credentials: "include",
    });
    const json: ApiResponse<ShiftResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch shift");
    }

    return json.data;
  },

  updateShift: async (
    id: string,
    data: UpdateScheduleRequest | ApproveShiftRequest
  ): Promise<ShiftResponse> => {
    const res = await fetch(`${API_BASE}/shifts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<ShiftResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update shift");
    }

    return json.data;
  },

  deleteShift: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/shifts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to delete shift");
    }

    return json.data;
  },

  // Punches (Time clock endpoints)
  getPunches: async (params?: PunchesQueryParams): Promise<PunchResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.all) searchParams.set("all", "true");
    if (params?.shiftId) searchParams.set("shiftId", params.shiftId);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    const url = `${API_BASE}/punches${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    const res = await fetch(url, { credentials: "include" });
    const json: ApiResponse<PunchResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch punches");
    }

    return json.data;
  },

  getPunch: async (id: string): Promise<PunchResponse> => {
    const res = await fetch(`${API_BASE}/punches/${id}`, {
      credentials: "include",
    });
    const json: ApiResponse<PunchResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch punch");
    }

    return json.data;
  },

  createPunch: async (data: CreatePunchRequest): Promise<PunchResponse> => {
    const res = await fetch(`${API_BASE}/punches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<PunchResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to create punch");
    }

    return json.data;
  },

  updatePunchNotes: async (
    id: string,
    data: UpdatePunchNotesRequest
  ): Promise<PunchResponse> => {
    const res = await fetch(`${API_BASE}/punches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<PunchResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update punch notes");
    }

    return json.data;
  },

  deletePunch: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/punches/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to delete punch");
    }

    return json.data;
  },
};
