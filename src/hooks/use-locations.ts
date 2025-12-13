import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateLocationRequest,
  GetLocationsParams,
  LocationResponse,
  UpdateLocationRequest,
} from "@/lib/api/locations";
import { locationsApi } from "@/lib/api/locations";

/**
 * Query key factory for locations
 */
const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (params?: GetLocationsParams) =>
    [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

/**
 * Hook to fetch all locations with optional filtering
 */
export function useLocations(params?: GetLocationsParams) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => locationsApi.getLocations(params),
  });
}

/**
 * Hook to fetch active locations only
 */
export function useActiveLocations() {
  return useLocations({ activeOnly: true });
}

/**
 * Hook to fetch a single location by ID
 */
export function useLocation(id: string) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => locationsApi.getLocation(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new location
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) =>
      locationsApi.createLocation(data),
    onSuccess: (newLocation) => {
      // Invalidate all location lists
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });

      toast.success("Location created", {
        description: `${newLocation.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create location", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing location
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      locationsApi.updateLocation(id, data),
    onSuccess: (updatedLocation) => {
      // Invalidate all location lists and the specific location detail
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(updatedLocation._id),
      });

      toast.success("Location updated", {
        description: `${updatedLocation.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update location", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a location
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
    onSuccess: () => {
      // Invalidate all location lists
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });

      toast.success("Location deleted", {
        description: "The location has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete location", {
        description: error.message,
      });
    },
  });
}
