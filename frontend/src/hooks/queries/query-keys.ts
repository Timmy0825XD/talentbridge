export const queryKeys = {
  applications: {
    me: ['applications', 'me'] as const,
  },
  profile: {
    candidate: ['profile', 'candidate'] as const,
    company: ['profile', 'company'] as const,
  },
  jobs: {
    list: (params?: Record<string, string>) => ['jobs', 'list', params ?? {}] as const,
    companyMine: ['jobs', 'company', 'mine'] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    applicants: (id: string) => ['jobs', 'applicants', id] as const,
  },
  contracts: {
    list: ['contracts', 'list'] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
    deliverables: (id: string) => ['contracts', 'deliverables', id] as const,
  },
  ranking: {
    me: ['ranking', 'me'] as const,
  },
  keywords: {
    all: ['keywords', 'all'] as const,
  },
  universities: {
    all: ['universities', 'all'] as const,
  },
} as const;
