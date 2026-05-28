import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';

export interface CandidateSearchParams {
  search?: string;
  skills?: string;
  career?: string;
  workMode?: string;
  minScore?: string;
  page?: number;
  limit?: number;
}

export interface CandidateSearchItem {
  id: string;
  userId: string;
  fullName: string | null;
  career: string | null;
  institution: string | null;
  photoUrl: string | null;
  workMode: string | null;
  skills: string[];
  softSkills: string[];
  profileScore: { totalScore: number } | null;
  reputationAvg: number | null;
  ratingCount: number;
}

export interface CandidateSearchResponse {
  candidates: CandidateSearchItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useCandidateSearch(params: CandidateSearchParams, enabled = true) {
  // Convertir params a Record<string, string> para la query key y la petición
  const queryParams: Record<string, string> = {};
  if (params.search)   queryParams.search   = params.search;
  if (params.skills)   queryParams.skills   = params.skills;
  if (params.career)   queryParams.career   = params.career;
  if (params.workMode) queryParams.workMode = params.workMode;
  if (params.minScore) queryParams.minScore = params.minScore;
  if (params.page)     queryParams.page     = String(params.page);
  if (params.limit)    queryParams.limit    = String(params.limit);

  return useQuery({
    queryKey: ['candidates', 'search', queryParams],
    queryFn: async () => {
      const res = await api.get<CandidateSearchResponse>('/candidates/search', {
        params: queryParams,
      });
      return res.data;
    },
    enabled,
    staleTime: 60_000,
  });
}