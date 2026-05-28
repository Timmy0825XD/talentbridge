import { useQueries, useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export function useJobsList(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: async () => {
      const res = await api.get('/jobs', { params });
      const data = res.data;
      return (data.jobs ?? data) as unknown[];
    },
    enabled,
  });
}

export function useCompanyJobs(enabled = true, userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.jobs.companyMine, userId],
    queryFn: async () => {
      const res = await api.get('/jobs/company/mine');
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}

export function useJobDetail(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data;
    },
    enabled: enabled && !!jobId,
  });
}

export function useJobApplicants(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.applicants(jobId),
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}/applicants`);
      return res.data;
    },
    enabled: enabled && !!jobId,
  });
}

export function useJobApplicantsBatch(jobIds: string[], enabled = true) {
  return useQueries({
    queries: jobIds.map(id => ({
      queryKey: queryKeys.jobs.applicants(id),
      queryFn: async () => {
        const res = await api.get(`/jobs/${id}/applicants`);
        return res.data;
      },
      enabled: enabled && !!id,
    })),
  });
}
