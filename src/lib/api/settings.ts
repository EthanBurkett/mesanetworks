import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CacheSettings {
  enabled: boolean;
  ttl: number;
  redisUrl?: string;
  compression: boolean;
}

interface ApiSettings {
  rateLimit: number;
  maxRequestSize: number;
  logging: boolean;
}

interface Settings {
  _id: string;
  cache: CacheSettings;
  api: ApiSettings;
  createdAt: string;
  updatedAt: string;
}

interface CacheStats {
  enabled: boolean;
  connected: boolean;
  keys: number;
  memory: string;
}

// Get settings
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Settings }>("/api/v1/settings");
      return data.data;
    },
  });
}

// Update settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      cache?: Partial<CacheSettings>;
      api?: Partial<ApiSettings>;
    }) => {
      const { data } = await axios.patch<{ data: Settings }>(
        "/api/v1/settings",
        updates
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    },
  });
}

// Get cache stats
export function useCacheStats() {
  return useQuery({
    queryKey: ["cache-stats"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: CacheStats }>("/api/v1/cache");
      return data.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Initialize cache
export function useInitializeCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: CacheStats }>(
        "/api/v1/cache/init"
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    },
  });
}

// Clear cache
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/v1/cache");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cache-stats"] });
    },
  });
}
