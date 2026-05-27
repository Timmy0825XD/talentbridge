import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export function useCandidateProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.candidate,
    queryFn: async () => {
      const res = await api.get('/profile/candidate');
      return res.data;
    },
    enabled,
  });
}

export function useCompanyProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.company,
    queryFn: async () => {
      const res = await api.get('/profile/company');
      return res.data;
    },
    enabled,
  });
}
