import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useFieldPlots = () =>
  useQuery({
    queryKey: ["fieldplots"],
    queryFn: api.getFieldPlots,
    staleTime: 5 * 60 * 1000,
  });

export const useTrees = () =>
  useQuery({
    queryKey: ["trees"],
    queryFn: api.getTrees,
    staleTime: 5 * 60 * 1000,
  });

export const useRasters = () =>
  useQuery({
    queryKey: ["rasters"],
    queryFn: api.getRasters,
    staleTime: 5 * 60 * 1000,
  });
