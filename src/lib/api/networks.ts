import { ApiResponse } from "@/lib/api-utils";
import type {
  NetworkNode,
  NetworkEdge,
} from "@/lib/db/models/NetworkDesign.model";

const API_BASE = "/api/v1/networks";

export interface NetworkResponse {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metadata?: {
    nodeIdCounter?: number;
    edgeIdCounter?: number;
    layoutAlgorithm?: string;
  };
  isPublic: boolean;
  shareSlug?: string;
  sharedWith: string[];
  _createdAt: Date;
  _updatedAt: Date;
  lastModifiedAt?: Date;
}

export interface CreateNetworkRequest {
  name: string;
  description?: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metadata?: {
    nodeIdCounter?: number;
    edgeIdCounter?: number;
    layoutAlgorithm?: string;
  };
}

export interface UpdateNetworkRequest {
  name?: string;
  description?: string;
  nodes?: NetworkNode[];
  edges?: NetworkEdge[];
  metadata?: {
    nodeIdCounter?: number;
    edgeIdCounter?: number;
    layoutAlgorithm?: string;
  };
  isPublic?: boolean;
}

export interface ShareNetworkRequest {
  isPublic: boolean;
  regenerateSlug?: boolean;
}

export interface ShareNetworkResponse {
  isPublic: boolean;
  shareSlug?: string;
  shareUrl: string | null;
}

/**
 * Network API client
 */
export const networksApi = {
  /**
   * Get all networks for the current user
   */
  getNetworks: async (): Promise<NetworkResponse[]> => {
    const res = await fetch(API_BASE, { credentials: "include" });
    const json: ApiResponse<NetworkResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch networks");
    }

    return json.data;
  },

  /**
   * Get a single network by ID
   */
  getNetwork: async (id: string): Promise<NetworkResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
    const json: ApiResponse<NetworkResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch network");
    }

    return json.data;
  },

  /**
   * Create a new network
   */
  createNetwork: async (
    data: CreateNetworkRequest
  ): Promise<NetworkResponse> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<NetworkResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to create network");
    }

    return json.data;
  },

  /**
   * Update an existing network
   */
  updateNetwork: async (
    id: string,
    data: UpdateNetworkRequest
  ): Promise<NetworkResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<NetworkResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update network");
    }

    return json.data;
  },

  /**
   * Delete a network
   */
  deleteNetwork: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json: ApiResponse<{ success: boolean }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to delete network");
    }

    return json.data;
  },

  /**
   * Share a network (generate public link)
   */
  shareNetwork: async (
    id: string,
    data: ShareNetworkRequest
  ): Promise<ShareNetworkResponse> => {
    const res = await fetch(`${API_BASE}/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const json: ApiResponse<ShareNetworkResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to share network");
    }

    return json.data;
  },

  /**
   * Get a shared network by slug (public access)
   */
  getSharedNetwork: async (slug: string): Promise<NetworkResponse> => {
    const res = await fetch(`/api/v1/shared/${slug}`);
    const json: ApiResponse<NetworkResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch shared network");
    }

    return json.data;
  },
};
