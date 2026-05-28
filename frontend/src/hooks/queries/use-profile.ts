import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export function useCandidateProfile(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.profile.candidate, userId],
    queryFn: async () => {
      const res = await api.get('/profile/candidate');
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}

export function useCompanyProfile(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.profile.company, userId],
    queryFn: async () => {
      const res = await api.get('/profile/company');
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}
