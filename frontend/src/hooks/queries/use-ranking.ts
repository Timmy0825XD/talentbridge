import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { ProfileScoreResponse } from '@/src/types/api';
import { queryKeys } from './query-keys';

export function useMyRanking(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.ranking.me, userId],
    queryFn: async () => {
      const res = await api.get<ProfileScoreResponse>('/ranking/me');
      return res.data;
    },
    enabled: enabled && !!userId,
    retry: false,
  });
}
