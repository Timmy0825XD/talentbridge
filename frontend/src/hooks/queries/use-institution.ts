import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { queryKeys } from './query-keys';

export interface InstitutionDashboardResponse {
  institutionName: string;
  metrics: {
    activeStudents: number;
    activeGraduates: number;
    graduatesWithCompletedContract: number;
    insertionRatePercent: number;
  };
  funnel: {
    linked: number;
    profileComplete: number;
    hasApplied: number;
    hasSelected: number;
    hasCompletedContract: number;
  };
  marketDemandSkills: Array<{ skill: string; count: number }>;
  graduateSkills: Array<{ skill: string; count: number }>;
  skillsGap: Array<{ skill: string; marketCount: number }>;
}

export type InstitutionEmploymentStatus =
  | 'incomplete_profile'
  | 'no_applications'
  | 'in_process'
  | 'hired';

export interface InstitutionCandidateItem {
  id: string;
  fullName: string | null;
  career: string | null;
  graduationYear: number | null;
  photoUrl: string | null;
  role: string;
  totalScore: number | null;
  applicationCount: number;
  hasCompletedContract: boolean;
  latestApplicationStatus: string | null;
  employmentStatus: InstitutionEmploymentStatus;
}

export interface InstitutionCandidatesParams {
  role?: 'STUDENT' | 'GRADUATE';
  career?: string;
  status?: 'all' | 'incomplete_profile' | 'no_applications' | 'in_process' | 'hired';
  search?: string;
  page?: number;
  limit?: number;
}

export interface InstitutionCandidatesResponse {
  items: InstitutionCandidateItem[];
  total: number;
  page: number;
  limit: number;
}

export interface InstitutionAnalyticsResponse {
  byCareer: Array<{
    career: string;
    linked: number;
    withCompletedContract: number;
    insertionRatePercent: number;
  }>;
  insertionTrend: Array<{ month: string; count: number }>;
  applicationsTrend: Array<{ month: string; count: number }>;
  topHiringAreas: Array<{ area: string; count: number }>;
  avgGraduateScore: number | null;
}

function toQueryRecord(params: InstitutionCandidatesParams): Record<string, string> {
  const q: Record<string, string> = {};
  if (params.role) q.role = params.role;
  if (params.career) q.career = params.career;
  if (params.status && params.status !== 'all') q.status = params.status;
  if (params.search) q.search = params.search;
  if (params.page) q.page = String(params.page);
  if (params.limit) q.limit = String(params.limit);
  return q;
}

export function useInstitutionDashboard(enabled = true, userId?: string) {
  return useQuery({
    queryKey: queryKeys.institution.dashboard(userId),
    queryFn: async () => {
      const res = await api.get<InstitutionDashboardResponse>('/institution/dashboard');
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });
}

export function useInstitutionCandidates(
  params: InstitutionCandidatesParams,
  enabled = true,
  userId?: string
) {
  return useQuery({
    queryKey: queryKeys.institution.candidates(userId, params),
    queryFn: async () => {
      const res = await api.get<InstitutionCandidatesResponse>('/institution/candidates', {
        params: toQueryRecord(params),
      });
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 30_000,
  });
}

export function useInstitutionAnalytics(enabled = true, userId?: string) {
  return useQuery({
    queryKey: queryKeys.institution.analytics(userId),
    queryFn: async () => {
      const res = await api.get<InstitutionAnalyticsResponse>('/institution/analytics');
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });
}
