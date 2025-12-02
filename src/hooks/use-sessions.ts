import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

/**
 * Hook to fetch all active user sessions
 */
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: authApi.getSessions,
  });
}

/**
 * Hook to revoke a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
