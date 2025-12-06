import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  hasBackupCodes: boolean;
  backupCodesCount: number;
}

export interface SetupResponse {
  secret: string;
  qrCode: string;
  message: string;
}

export interface VerifyResponse {
  message: string;
  backupCodes: string[];
}

/**
 * Fetch 2FA status for the current user
 */
export function useTwoFactorStatus() {
  return useQuery<TwoFactorStatus>({
    queryKey: ["2fa-status"],
    queryFn: async () => {
      const res = await fetch("/api/v1/auth/2fa/status");
      if (!res.ok) throw new Error("Failed to fetch 2FA status");
      const data = await res.json();
      return data.data;
    },
  });
}

/**
 * Setup 2FA - generates TOTP secret and QR code
 */
export function useSetupTwoFactor() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/auth/2fa/setup", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to setup 2FA");
      const data = await res.json();
      return data.data as SetupResponse;
    },
  });
}

/**
 * Verify TOTP token and enable 2FA
 */
export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/v1/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Verification failed");
      }
      const data = await res.json();
      return data.data as VerifyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      toast.success("Two-factor authentication enabled!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}

/**
 * Disable 2FA (requires verification)
 */
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/v1/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to disable 2FA");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      toast.success("Two-factor authentication disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}

/**
 * Regenerate backup codes (requires verification)
 */
export function useRegenerateBackupCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/v1/auth/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Failed to regenerate backup codes");
      const data = await res.json();
      return data.data.backupCodes as string[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      toast.success("Backup codes regenerated");
    },
    onError: () => {
      toast.error("Failed to regenerate backup codes");
    },
  });
}

/**
 * Validate TOTP token during login
 */
export function useValidateTwoFactor() {
  return useMutation({
    mutationFn: async (data: { token?: string; backupCode?: string }) => {
      const res = await fetch("/api/v1/auth/2fa/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Validation failed");
      }
      const result = await res.json();
      return result.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid verification code");
    },
  });
}
