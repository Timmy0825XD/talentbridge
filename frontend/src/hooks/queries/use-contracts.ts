import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { Contract } from '@/src/types/api';
import { queryKeys } from './query-keys';

export function useContracts(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.contracts.list, userId],
    queryFn: async () => {
      const res = await api.get<Contract[]>('/contracts');
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}

export function useContractDetail(contractId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(contractId),
    queryFn: async () => {
      const res = await api.get(`/contracts/${contractId}`);
      return res.data;
    },
    enabled: enabled && !!contractId,
  });
}
