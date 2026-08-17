import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProfile, updateProfile, type Profile, type UpdateProfileInput } from "./api";

export const PROFILE_KEY = ["profile"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (_result, input) => {
      queryClient.setQueryData<Profile | null>(PROFILE_KEY, (current) =>
        current ? { ...current, ...input } : current,
      );
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}
