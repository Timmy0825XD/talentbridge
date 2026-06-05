import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export function useKeywords(enabled = true) {
  return useQuery({
    queryKey: queryKeys.keywords.all,
    queryFn: async () => {
      const res = await api.get('/keywords');
      return res.data;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}
