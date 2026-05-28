import { useQuery } from '@tanstack/react-query';
import api from '@/src/lib/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CompanyDashboardResponse {
  metrics: {
    activeJobs: number;
    totalApplicants: number;
    selectingJobs: number;
    activeContracts: number;
    completedContracts: number;
    accumulatedCost: number;
    avgCandidateRating: number | null;
  };
  activeJobs: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    workMode: string;
    area: string | null;
    createdAt: string;
    _count: { applications: number };
  }>;
  topCandidates: Array<{
    id: string;
    fullName: string | null;
    career: string | null;
    skills: string[];
    photoUrl: string | null;
    scoreAtApply: number | null;
    profileScore: { totalScore: number } | null;
  }>;
}

export interface CandidateDashboardResponse {
  score: {
    totalScore: number;
    breakdown: Record<string, number>;
    suggestions: string[];
    calculatedAt: string;
  } | null;
  metrics: {
    activeApplications: number;
    selectedApplications: number;
    activeContracts: number;
    pendingContracts: number;
    completedContracts: number;
    registeredIncome: number;
    avgRatingReceived: number | null;
  };
  recentApplications: Array<{
    id: string;
    jobId: string;
    status: string;
    scoreAtApply: number | null;
    createdAt: string;
    job: {
      id: string;
      title: string;
      type: string;
      workMode: string;
      company: { companyName: string | null; logoUrl: string | null; city: string | null };
    };
  }>;
  activeContracts: Array<{
    id: string;
    title: string;
    status: string;
    totalAmount: number | null;
    company: { companyName: string | null } | null;
  }>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCompanyDashboard(enabled = true, userId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'company', userId],
    queryFn: async () => {
      const res = await api.get<CompanyDashboardResponse>('/dashboard/company');
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });
}

export function useCandidateDashboard(enabled = true, userId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'candidate', userId],
    queryFn: async () => {
      const res = await api.get<CandidateDashboardResponse>('/dashboard/candidate');
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });
}
