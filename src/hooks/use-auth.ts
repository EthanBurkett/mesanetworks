import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import type {
  LoginSchema,
  RegisterSchema,
  SendCodeSchema,
  VerifyCodeSchema,
  ResetPasswordSchema,
} from "@/schemas/auth.schema";

/**
 * Hook to fetch the current authenticated user
 */
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: authApi.getMe,
    retry: false,
  });
}

/**
 * Hook to handle user login
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/");
    },
  });
}

/**
 * Hook to handle user registration
 */
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

/**
 * Hook to handle user logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Hook to send verification code to email
 */
export function useSendVerificationCode() {
  return useMutation({
    mutationFn: authApi.sendVerificationCode,
  });
}

/**
 * Hook to verify email with code
 */
export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      router.push("/login");
    },
  });
}

/**
 * Hook to send password reset code
 */
export function useSendPasswordResetCode() {
  return useMutation({
    mutationFn: authApi.sendPasswordResetCode,
  });
}

/**
 * Hook to reset password with code
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
