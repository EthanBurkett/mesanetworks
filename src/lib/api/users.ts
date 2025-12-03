import { ApiResponse } from "@/lib/api-utils";

const API_BASE = "/api/v1/auth/users";

export interface UserResponse {
  _id: string;
  auth0Id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  roles?: Array<{
    _id: string;
    name: string;
    description: string;
    permissions: string[];
    hierarchyLevel: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  getUsers: async (): Promise<UserResponse[]> => {
    const res = await fetch(API_BASE, {
      credentials: "include",
    });

    const json: ApiResponse<UserResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch users");
    }

    return json.data;
  },

  updateUserRoles: async (
    userId: string,
    roles: string[]
  ): Promise<UserResponse> => {
    const res = await fetch(`${API_BASE}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
      credentials: "include",
    });

    const json: ApiResponse<UserResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update user roles");
    }

    return json.data;
  },
};
