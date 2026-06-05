import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { ApplicationWithJob } from '@/src/types/api';
import { queryKeys } from './query-keys';

export function useMyApplications(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.applications.me, userId],
    queryFn: async () => {
      const res = await api.get<ApplicationWithJob[]>('/applications/me');
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}
