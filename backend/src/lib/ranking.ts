// Pesos globales por defecto del motor de ranking
// Deben sumar exactamente 1.0
export const DEFAULT_WEIGHTS = {
  skills: 0.30,       // Habilidades técnicas
  experience: 0.25,   // Experiencia y proyectos
  education: 0.15,    // Formación académica
  certs: 0.10,        // Certificaciones
  reputation: 0.10,   // Reputación en plataforma
  languages: 0.05,    // Idiomas
  completion: 0.05,   // Completitud del perfil
};

export interface RankingWeights {
  skills: number;
  experience: number;
  education: number;
  certs: number;
  reputation: number;
  languages: number;
  completion: number;
}

export interface CandidateData {
  skills: string[];
  softSkills: string[];
  languages: any;
  projects: any;
  certifications: any;
  career: string | null;
  institution: string | null;
  semester: number | null;
  graduationYear: number | null;
  summary: string | null;
  cvUrl: string | null;
  fullName: string | null;
  phone: string | null;
  workMode: string | null;
  salaryExpected: number | null;
  reputationScore?: number; // Promedio de calificaciones recibidas (Sprint 4)
}

export interface ScoreBreakdown {
  total: number;
  skills: number;
  experience: number;
  education: number;
  certs: number;
  reputation: number;
  languages: number;
  completion: number;
}

// ─── CRITERIO 1: Habilidades técnicas (30%) ───────────────────────────────────
// Evalúa la cantidad y diversidad de habilidades técnicas del candidato
function scoreSkills(skills: string[]): number {
  if (!skills || skills.length === 0) return 0;

  // Escala logarítmica: más habilidades = más puntos, pero con rendimiento decreciente
  // 5 skills = ~60 pts, 10 skills = ~80 pts, 20+ skills = ~100 pts
  const raw = Math.min(100, Math.log2(skills.length + 1) * 33);
  return Math.round(raw);
}

// ─── CRITERIO 2: Experiencia y proyectos (25%) ────────────────────────────────
// Evalúa proyectos registrados y resumen profesional
function scoreExperience(projects: any, summary: string | null): number {
  let score = 0;

  // Proyectos registrados en el perfil
  const projectList = Array.isArray(projects) ? projects : [];
  if (projectList.length >= 1) score += 30;
  if (projectList.length >= 3) score += 30;
  if (projectList.length >= 5) score += 20;

  // Resumen profesional escrito
  if (summary && summary.length > 50) score += 20;

  return Math.min(100, score);
}

// ─── CRITERIO 3: Formación académica (15%) ────────────────────────────────────
// Evalúa institución, carrera y avance académico
function scoreEducation(
  career: string | null,
  institution: string | null,
  semester: number | null,
  graduationYear: number | null
): number {
  let score = 0;

  if (institution && institution.length > 0) score += 30;
  if (career && career.length > 0) score += 30;

  // Estudiante con semestre avanzado
  if (semester !== null) {
    score += Math.min(40, semester * 5); // 1 sem = 5pts, 8 sem = 40pts
  }

  // Egresado tiene puntuación completa en este criterio
  if (graduationYear !== null) {
    score = 100;
  }

  return Math.min(100, score);
}

// ─── CRITERIO 4: Certificaciones (10%) ───────────────────────────────────────
function scoreCertifications(certifications: any): number {
  const certList = Array.isArray(certifications) ? certifications : [];
  if (certList.length === 0) return 0;
  if (certList.length === 1) return 40;
  if (certList.length === 2) return 65;
  if (certList.length === 3) return 80;
  return 100; // 4 o más
}

// ─── CRITERIO 5: Reputación (10%) ─────────────────────────────────────────────
// En Sprint 1 y 2 todos empiezan en 0 — se activa en Sprint 4
function scoreReputation(reputationScore?: number): number {
  if (!reputationScore || reputationScore === 0) return 50; // Neutro para nuevos
  // reputationScore es 1-5 estrellas → convertir a 0-100
  return Math.round(((reputationScore - 1) / 4) * 100);
}

// ─── CRITERIO 6: Idiomas (5%) ─────────────────────────────────────────────────
function scoreLanguages(languages: any): number {
  const langList = Array.isArray(languages) ? languages : [];
  if (langList.length === 0) return 0;
  if (langList.length === 1) return 50;
  if (langList.length === 2) return 80;
  return 100; // 3 o más
}

// ─── CRITERIO 7: Completitud del perfil (5%) ──────────────────────────────────
function scoreCompletion(data: CandidateData): number {
  const fields = [
    data.fullName,
    data.phone,
    data.summary,
    data.career,
    data.institution,
    data.cvUrl,
    data.workMode,
    data.salaryExpected,
  ];

  const hasSkills = data.skills && data.skills.length > 0;
  const hasSoftSkills = data.softSkills && data.softSkills.length > 0;

  const filledFields = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  const totalFields = fields.length + 2; // +2 para skills y softSkills

  const filled = filledFields + (hasSkills ? 1 : 0) + (hasSoftSkills ? 1 : 0);
  return Math.round((filled / totalFields) * 100);
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
export function calculateScore(
  data: CandidateData,
  weights: RankingWeights = DEFAULT_WEIGHTS
): ScoreBreakdown {
  const skills = scoreSkills(data.skills);
  const experience = scoreExperience(data.projects, data.summary);
  const education = scoreEducation(data.career, data.institution, data.semester, data.graduationYear);
  const certs = scoreCertifications(data.certifications);
  const reputation = scoreReputation(data.reputationScore);
  const languages = scoreLanguages(data.languages);
  const completion = scoreCompletion(data);

  const total = Math.round(
    skills * weights.skills +
    experience * weights.experience +
    education * weights.education +
    certs * weights.certs +
    reputation * weights.reputation +
    languages * weights.languages +
    completion * weights.completion
  );

  return {
    total: Math.min(100, total),
    skills,
    experience,
    education,
    certs,
    reputation,
    languages,
    completion,
  };
}