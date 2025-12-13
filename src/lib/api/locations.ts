import { ApiResponse } from "@/lib/api-utils";

const API_BASE = "/api/v1/locations";

export interface LocationResponse {
  _id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contact?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contact?: string;
  isActive?: boolean;
}

export interface GetLocationsParams {
  activeOnly?: boolean;
  search?: string;
  city?: string;
  state?: string;
}

/**
 * Location API client
 */
export const locationsApi = {
  /**
   * Get all locations with optional filtering
   */
  getLocations: async (
    params?: GetLocationsParams
  ): Promise<LocationResponse[]> => {
    const searchParams = new URLSearchParams();

    if (params?.activeOnly) searchParams.set("activeOnly", "true");
    if (params?.search) searchParams.set("search", params.search);
    if (params?.city) searchParams.set("city", params.city);
    if (params?.state) searchParams.set("state", params.state);

    const url = `${API_BASE}${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    const res = await fetch(url, { credentials: "include" });
    const json: ApiResponse<LocationResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch locations");
    }

    return json.data;
  },

  /**
   * Get a single location by ID
   */
  getLocation: async (id: string): Promise<LocationResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
    const json: ApiResponse<LocationResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch location");
    }

    return json.data;
  },

  /**
   * Create a new location
   */
  createLocation: async (
    data: CreateLocationRequest
  ): Promise<LocationResponse> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<LocationResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to create location");
    }

    return json.data;
  },

  /**
   * Update an existing location
   */
  updateLocation: async (
    id: string,
    data: UpdateLocationRequest
  ): Promise<LocationResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<LocationResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update location");
    }

    return json.data;
  },

  /**
   * Delete a location
   */
  deleteLocation: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to delete location");
    }

    return json.data;
  },
};
