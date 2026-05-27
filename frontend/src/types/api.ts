// ─── Enums (mirror Prisma) ───────────────────────────────────────────────────
export type UserRole        = 'STUDENT' | 'GRADUATE' | 'COMPANY' | 'INSTITUTION' | 'ADMIN';
export type JobStatus       = 'ACTIVE' | 'SELECTING' | 'CLOSED' | 'CANCELLED';
export type JobType         = 'FORMAL' | 'FREELANCE';
export type WorkMode        = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ApplicationStatus = 'RECEIVED' | 'REVIEWING' | 'SELECTED' | 'REJECTED';
export type ContractStatus  = 'PENDING_CANDIDATE' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus   = 'PENDING' | 'CONFIRMED';
export type PaymentScheme   = 'SINGLE' | 'MILESTONES' | 'PERIODIC';
export type DeliverableStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token:  string;
  role:   UserRole;
  userId: string; // User.id
}
export interface RegisterResponse {
  message: string;
  userId:  string;
}
export interface NotVerifiedError {
  error:   string;
  code:    'NOT_VERIFIED';
  userId?: string;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────
export interface ProfileScoreResponse {
  totalScore: number;
  breakdown: {
    skills:     number;
    experience: number;
    education:  number;
    certs:      number;
    reputation: number;
    completion: number;
  };
  calculatedAt: string;
  suggestions:  string[];
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export interface JobListItem {
  id:           string;
  title:        string;
  description:  string;
  type:         JobType;
  status:       JobStatus;
  workMode:     WorkMode;
  area:         string | null;
  skills:       string[];
  budgetMin:    number | null;
  budgetMax:    number | null;
  duration:     string | null;
  deadline:     string | null;
  deliverables: string | null;
  createdAt:    string;
  company?: {
    companyName: string | null;
    logoUrl:     string | null;
    city:        string | null;
  };
}
export interface JobsListResponse {
  jobs:       JobListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Applications ─────────────────────────────────────────────────────────────
export interface ApplicationWithJob {
  id:           string;
  jobId:        string;
  candidateId:  string;
  status:       ApplicationStatus;
  scoreAtApply: number | null;
  aiReasons:    string[];
  aiGaps:       string[];
  createdAt:    string;
  updatedAt:    string;
  job: Pick<JobListItem, 'id' | 'title' | 'type' | 'workMode' | 'status' | 'budgetMin' | 'budgetMax'> & {
    company: { companyName: string | null; logoUrl: string | null; city: string | null };
  };
}
export interface ApplyResponse {
  message:     string;
  application: {
    id:           string;
    status:       ApplicationStatus;
    scoreAtApply: number | null;
    job: { id: string; title: string };
  };
  aiInsights: { reasons: string[]; gaps: string[] };
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export interface Payment {
  id:          string;
  contractId:  string;
  amount:      number;
  description: string;
  dueDate:     string | null;
  sequence:    number;
  receiptUrl:  string | null;
  status:      PaymentStatus;
  confirmedAt: string | null;
  createdAt:   string;
}
export interface Deliverable {
  id:               string;
  contractId:       string;
  title:            string;
  description:      string;
  dueDate:          string | null;
  status:           DeliverableStatus;
  fileUrl:          string | null;
  candidateNotes:   string | null;
  companyFeedback:  string | null;
  submittedAt:      string | null;
  reviewedAt:       string | null;
  createdAt:        string;
  updatedAt:        string;
}
export interface Contract {
  id:              string;
  jobId:           string;
  candidateId:     string;
  companyId:       string;
  applicationId:   string | null;
  title:           string;
  description:     string;
  deliverables:    string;           // texto libre resumen
  startDate:       string;
  endDate:         string;
  totalAmount:     number;
  paymentScheme:   PaymentScheme;
  contractFileUrl: string | null;
  status:          ContractStatus;
  confirmedAt:     string | null;
  cancelledAt:     string | null;
  createdAt:       string;
  updatedAt:       string;
  // Relaciones (list/detail)
  candidate?: {
    fullName:  string | null;
    photoUrl?: string | null;
    user?:     { email: string };
  };
  company?: { companyName: string | null; logoUrl?: string | null };
  job?:     { id: string; title: string };
  payments:          Payment[];
  deliverableItems?: Deliverable[];
  _count?: { payments: number; deliverableItems: number };
  // Enriquecido por backend
  paidAmount?:      number;
  pendingAmount?:   number;
  remainingAmount?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────
export interface CreateContractPayload {
  candidateId:    string;        // CandidateProfile.id
  title:          string;
  startDate:      string;        // ISO date "YYYY-MM-DD" — REQUERIDO
  endDate:        string;        // REQUERIDO, > startDate
  totalAmount:    number;
  jobId?:         string;
  description?:   string;
  deliverables?:  string;
  paymentScheme?: PaymentScheme;
  items?: { title: string; description?: string; dueDate?: string }[];
}
export interface CreatePaymentPayload {
  amount:       number;
  description?: string;
  dueDate?:     string;
  sequence?:    number;
}
export interface ReviewDeliverablePayload {
  status:           'APPROVED' | 'REJECTED';
  companyFeedback?: string;
}