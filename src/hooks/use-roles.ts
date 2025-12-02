import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  rolesApi,
  UpdateRoleRequest,
  CreateRoleRequest,
} from "@/lib/api/roles";

/**
 * Hook to fetch all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.getRoles,
  });
}

/**
 * Hook to create a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook to update a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: UpdateRoleRequest;
    }) => rolesApi.updateRole(roleId, data),
    onSuccess: () => {
      // Invalidate roles query to refetch
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      // Also invalidate user query in case their role permissions changed
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook to update role hierarchy (batch update)
 */
export function useUpdateRoleHierarchy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { roleId: string; hierarchyLevel: number }[]) =>
      rolesApi.updateRoleHierarchy(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
