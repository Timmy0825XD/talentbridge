// Pesos globales por defecto — modificables por vacante
export const DEFAULT_WEIGHTS = {
  skills: 0.20,       // Habilidades declaradas
  experience: 0.20,   // Experiencia y proyectos
  education: 0.20,    // Formación académica
  certs: 0.10,        // Certificaciones e idiomas
  reputation: 0.10,   // Reputación en plataforma
  completion: 0.20,   // Completitud del perfil
};

export interface RankingWeights {
  skills: number;
  experience: number;
  education: number;
  certs: number;
  reputation: number;
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
  photoUrl: string | null;
  workMode: string | null;
  salaryExpected: number | null;
  reputationScore?: number;
}

export interface ScoreBreakdown {
  total: number;
  skills: number;
  experience: number;
  education: number;
  certs: number;
  reputation: number;
  completion: number;
}

// ─── CRITERIO 1: Habilidades declaradas (20%) ─────────────────────────────────
// Evalúa cantidad y diversidad — no depende de keywords de la BD
function scoreSkills(skills: string[], softSkills: string[]): number {
  const techCount = skills?.length ?? 0;
  const softCount = softSkills?.length ?? 0;
  const total = techCount + softCount;

  if (total === 0) return 0;

  // Escala: 1=15, 3=35, 5=55, 8=75, 12=90, 15+=100
  const techScore = Math.min(100, Math.log2(techCount + 1) * 33);
  const softScore = Math.min(100, softCount * 15);
  const diversity = techCount > 0 && softCount > 0 ? 10 : 0; // Bonus por tener ambas

  return Math.min(100, Math.round((techScore * 0.7) + (softScore * 0.2) + diversity));
}

// ─── CRITERIO 2: Experiencia y proyectos (20%) ────────────────────────────────
function scoreExperience(projects: any, summary: string | null): number {
  let score = 0;
  const projectList = Array.isArray(projects) ? projects : [];

  // Proyectos con descripción valen más que sin ella
  for (const proj of projectList) {
    if (proj.title) score += 15;
    if (proj.description && proj.description.length > 20) score += 10;
    if (proj.url) score += 5;
  }

  // Resumen profesional bien escrito
  if (summary) {
    if (summary.length > 150) score += 20;
    else if (summary.length > 50) score += 10;
  }

  return Math.min(100, score);
}

// ─── CRITERIO 3: Formación académica (20%) ────────────────────────────────────
function scoreEducation(
  career: string | null,
  institution: string | null,
  semester: number | null,
  graduationYear: number | null
): number {
  let score = 0;

  if (institution && institution.length > 0) score += 25;
  if (career && career.length > 0) score += 25;

  if (graduationYear !== null) {
    // Egresado — puntuación máxima en formación
    score += 50;
  } else if (semester !== null) {
    // Estudiante — más puntos mientras más avanzado
    score += Math.min(50, semester * 6);
  }

  return Math.min(100, score);
}

// ─── CRITERIO 4: Certificaciones e idiomas (10%) ──────────────────────────────
function scoreCertsAndLanguages(certifications: any, languages: any): number {
  let score = 0;
  const certList = Array.isArray(certifications) ? certifications : [];
  const langList = Array.isArray(languages) ? languages : [];

  // Certificaciones
  score += Math.min(60, certList.length * 20);

  // Idiomas con nivel
  for (const lang of langList) {
    const level = lang.level ?? '';
    if (['C1', 'C2', 'Nativo'].includes(level)) score += 20;
    else if (['B1', 'B2'].includes(level)) score += 15;
    else score += 8;
  }

  return Math.min(100, score);
}

// ─── CRITERIO 5: Reputación (10%) ─────────────────────────────────────────────
function scoreReputation(reputationScore?: number): number {
  if (!reputationScore || reputationScore === 0) return 50;
  return Math.round(((reputationScore - 1) / 4) * 100);
}

// ─── CRITERIO 6: Completitud del perfil (20%) ─────────────────────────────────
function scoreCompletion(data: CandidateData): number {
  let filled = 0;
  const checks = [
    !!data.fullName,
    !!data.phone,
    !!data.summary && data.summary.length > 30,
    !!data.career,
    !!data.institution,
    !!data.cvUrl,
    !!data.photoUrl,
    !!data.workMode,
    !!data.salaryExpected,
    (data.skills?.length ?? 0) >= 3,
    (data.softSkills?.length ?? 0) >= 2,
    Array.isArray(data.languages) && data.languages.length > 0,
    Array.isArray(data.projects) && data.projects.length > 0,
  ];

  filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
export function calculateScore(
  data: CandidateData,
  weights: RankingWeights = DEFAULT_WEIGHTS
): ScoreBreakdown {
  const skills = scoreSkills(data.skills, data.softSkills);
  const experience = scoreExperience(data.projects, data.summary);
  const education = scoreEducation(data.career, data.institution, data.semester, data.graduationYear);
  const certs = scoreCertsAndLanguages(data.certifications, data.languages);
  const reputation = scoreReputation(data.reputationScore);
  const completion = scoreCompletion(data);

  const total = Math.round(
    skills     * weights.skills +
    experience * weights.experience +
    education  * weights.education +
    certs      * weights.certs +
    reputation * weights.reputation +
    completion * weights.completion
  );

  return {
    total: Math.min(100, total),
    skills,
    experience,
    education,
    certs,
    reputation,
    completion,
  };
}

// ─── COMBINAR SCORE BASE CON SCORE DE IA ─────────────────────────────────────
// Se usa al momento de postularse — combina el score del perfil con el de Gemini
export function combineScores(baseScore: number, aiScore: number): number {
  return Math.round((baseScore * 0.4) + (aiScore * 0.6));
}