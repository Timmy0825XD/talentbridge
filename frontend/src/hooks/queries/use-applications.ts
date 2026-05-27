import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { ApplicationWithJob } from '@/src/types/api';
import { queryKeys } from './query-keys';

export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.applications.me,
    queryFn: async () => {
      const res = await api.get<ApplicationWithJob[]>('/applications/me');
      return res.data;
    },
    enabled,
  });
}
