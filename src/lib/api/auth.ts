import {
  LoginSchema,
  RegisterSchema,
  SendCodeSchema,
  VerifyCodeSchema,
  ResetPasswordSchema,
} from "@/schemas/auth.schema";
import { ApiResponse } from "../api-utils";

const API_BASE = "/api/v1/auth";

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface SessionResponse {
  id: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export const authApi = {
  login: async (data: LoginSchema): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<LoginResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Login failed");
    }

    return json.data;
  },

  register: async (data: RegisterSchema): Promise<RegisterResponse> => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<RegisterResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Registration failed");
    }

    return json.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Logout failed");
    }

    return json.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await fetch(`${API_BASE}/me`, {
      credentials: "include",
    });

    const json: ApiResponse<UserResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch user");
    }

    return json.data;
  },

  sendVerificationCode: async (
    data: SendCodeSchema
  ): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/verify-email/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to send code");
    }

    return json.data;
  },

  verifyEmail: async (data: VerifyCodeSchema): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/verify-email/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to verify email");
    }

    return json.data;
  },

  sendPasswordResetCode: async (
    data: SendCodeSchema
  ): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/forgot-password/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to send reset code");
    }

    return json.data;
  },

  resetPassword: async (
    data: ResetPasswordSchema
  ): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to reset password");
    }

    return json.data;
  },

  getSessions: async (): Promise<SessionResponse[]> => {
    const res = await fetch(`${API_BASE}/me/sessions`, {
      credentials: "include",
    });

    const json: ApiResponse<SessionResponse[]> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch sessions");
    }

    return json.data;
  },

  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/me/sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to revoke session");
    }

    return json.data;
  },
};
