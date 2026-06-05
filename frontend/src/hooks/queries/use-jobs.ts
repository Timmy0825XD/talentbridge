import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export const JOBS_LIST_PAGE_SIZE = 12;

export interface JobsListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobsListResult {
  jobs: unknown[];
  pagination: JobsListPagination | null;
}

export function useJobsList(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: async (): Promise<JobsListResult> => {
      const res = await api.get('/jobs', {
        params: {
          limit: String(JOBS_LIST_PAGE_SIZE),
          page: '1',
          ...params,
        },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        return { jobs: data, pagination: null };
      }
      return {
        jobs: (data.jobs ?? []) as unknown[],
        pagination: data.pagination ?? null,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
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
