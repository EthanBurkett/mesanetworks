import { ApiResponse } from "../api-utils";
import { RoleResponse } from "./auth";

const API_BASE = "/api/v1/roles";

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  hierarchyLevel?: number;
  inherits?: boolean;
  inheritsFrom?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  hierarchyLevel?: number;
}

export const rolesApi = {
  /**
   * Get all roles
   */
  getRoles: async (): Promise<RoleResponse[]> => {
    const res = await fetch(API_BASE, {
      credentials: "include",
    });

    const json: ApiResponse<RoleResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch roles");
    }

    return json.data;
  },

  /**
   * Get a single role by ID
   */
  getRole: async (roleId: string): Promise<RoleResponse> => {
    const res = await fetch(`${API_BASE}/${roleId}`, {
      credentials: "include",
    });
    const json: ApiResponse<RoleResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch role");
    }

    return json.data;
  },

  /**
   * Create a new role
   */
  createRole: async (data: CreateRoleRequest): Promise<RoleResponse> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<RoleResponse> = await res.json();

    if (!json.success || !json.data) {
      const error = new Error(json.messages[0] || "Failed to create role");
      (error as any).code = json.code;
      (error as any).messages = json.messages;
      throw error;
    }

    return json.data;
  },

  /**
   * Update a role
   */
  updateRole: async (
    roleId: string,
    data: UpdateRoleRequest
  ): Promise<RoleResponse> => {
    const res = await fetch(`${API_BASE}/${roleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<RoleResponse> = await res.json();

    if (!json.success || !json.data) {
      const error = new Error(json.messages[0] || "Failed to update role");
      (error as any).code = json.code;
      (error as any).messages = json.messages;
      throw error;
    }

    return json.data;
  },

  /**
   * Batch update role hierarchy levels
   */
  updateRoleHierarchy: async (
    updates: { roleId: string; hierarchyLevel: number }[]
  ): Promise<void> => {
    // Update each role individually and collect errors
    const results = await Promise.allSettled(
      updates.map(({ roleId, hierarchyLevel }) =>
        rolesApi.updateRole(roleId, { hierarchyLevel })
      )
    );

    const errors = results.filter(
      (r) => r.status === "rejected"
    ) as PromiseRejectedResult[];
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => e.reason.message).join(", ");
      const error = new Error(errorMessages);
      throw error;
    }
  },
};
