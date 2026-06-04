import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export interface CareerOption {
  id: string;
  name: string;
}

export function useCareers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.careers.all,
    queryFn: async () => {
      const res = await api.get<CareerOption[]>('/careers');
      return res.data;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}
