import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export function useUniversities(enabled = true) {
  return useQuery({
    queryKey: queryKeys.universities.all,
    queryFn: async () => {
      const res = await api.get('/universities');
      return res.data as { id: string; name: string }[];
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}
