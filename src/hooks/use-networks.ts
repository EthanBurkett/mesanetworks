import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateNetworkRequest,
  NetworkResponse,
  UpdateNetworkRequest,
  ShareNetworkRequest,
} from "@/lib/api/networks";
import { networksApi } from "@/lib/api/networks";

/**
 * Query key factory for networks
 */
const networkKeys = {
  all: ["networks"] as const,
  lists: () => [...networkKeys.all, "list"] as const,
  list: () => [...networkKeys.lists()] as const,
  details: () => [...networkKeys.all, "detail"] as const,
  detail: (id: string) => [...networkKeys.details(), id] as const,
};

/**
 * Hook to fetch all networks for the current user
 */
export function useNetworks() {
  return useQuery({
    queryKey: networkKeys.list(),
    queryFn: () => networksApi.getNetworks(),
  });
}

/**
 * Hook to fetch a single network by ID
 */
export function useNetwork(id: string | null) {
  return useQuery({
    queryKey: networkKeys.detail(id!),
    queryFn: () => networksApi.getNetwork(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new network
 */
export function useCreateNetwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNetworkRequest) => networksApi.createNetwork(data),
    onSuccess: (newNetwork) => {
      // Invalidate all network lists
      queryClient.invalidateQueries({ queryKey: networkKeys.lists() });

      toast.success("Network created", {
        description: `${newNetwork.name} has been saved successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create network", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing network
 */
export function useUpdateNetwork(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNetworkRequest) =>
      networksApi.updateNetwork(id, data),
    onSuccess: (updatedNetwork) => {
      // Invalidate all network lists and the specific network detail
      queryClient.invalidateQueries({ queryKey: networkKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: networkKeys.detail(updatedNetwork._id),
      });

      toast.success("Network updated", {
        description: `${updatedNetwork.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update network", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a network
 */
export function useDeleteNetwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => networksApi.deleteNetwork(id),
    onSuccess: () => {
      // Invalidate all network lists
      queryClient.invalidateQueries({ queryKey: networkKeys.lists() });

      toast.success("Network deleted", {
        description: "The network has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete network", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to share a network (generate public link)
 */
export function useShareNetwork(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShareNetworkRequest) =>
      networksApi.shareNetwork(id, data),
    onSuccess: () => {
      // Invalidate the specific network detail
      queryClient.invalidateQueries({
        queryKey: networkKeys.detail(id),
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to share network", {
        description: error.message,
      });
    },
  });
}
