import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CompatibilityResult {
  score: number;
  reasons: string[];
  gaps: string[];
}

async function callGemini(prompt: string, attempt = 1): Promise<CompatibilityResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { score: 50, reasons: [], gaps: [] };

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Usamos Gemini 2.5 Flash que es el estándar actual del Free Tier
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      reasons: parsed.reasons ?? [],
      gaps: parsed.gaps ?? [],
    };
  } catch (err: any) {
    // Si es un error 404, es el nombre del modelo. No reintentar.
    if (err.message?.includes('404')) {
      console.error("Error: El modelo no existe. Revisa el nombre del modelo en Google AI Studio.");
      return { score: 0, reasons: ["Error de configuración de IA"], gaps: [] };
    }

    const isRateLimit = err.status === 429 || err.message?.includes('429');

    if (isRateLimit && attempt < 3) {
      const waitMs = attempt * 5000;
      console.log(`Rate limit (429). Reintentando en ${waitMs/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return callGemini(prompt, attempt + 1);
    }

    console.error("Gemini Error Fatal:", err.message);
    return { score: 50, reasons: [], gaps: [] };
  }
}

export async function scoreCompatibility(
  candidate: {
    career: string | null;
    skills: string[];
    softSkills: string[];
    languages: any;
    projects: any;
    certifications: any;
    summary: string | null;
    workMode: string | null;
  },
  job: {
    title: string;
    area: string | null;
    skills: string[];
    description: string;
    workMode: string;
    type: string;
  }
): Promise<CompatibilityResult> {
  const languagesText = Array.isArray(candidate.languages)
    ? candidate.languages.map((l: any) => `${l.language} (${l.level})`).join(', ')
    : 'No especificados';

  const projectsText = Array.isArray(candidate.projects) && candidate.projects.length > 0
    ? candidate.projects.map((p: any) => p.title).join(', ')
    : 'Ninguno registrado';

  const certsText = Array.isArray(candidate.certifications) && candidate.certifications.length > 0
    ? candidate.certifications.map((c: any) => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join(', ')
    : 'Ninguna';

  const prompt = `
  Eres un experto en reclutamiento y evaluación de talento universitario en Colombia.
  Evalúa la compatibilidad entre este candidato y esta vacante de manera objetiva.

  VACANTE:
  - Título: ${job.title}
  - Área: ${job.area ?? 'No especificada'}
  - Tipo: ${job.type === 'FORMAL' ? 'Contrato formal' : 'Proyecto freelance'}
  - Modalidad: ${job.workMode}
  - Habilidades requeridas: ${job.skills.join(', ')}
  - Descripción: ${job.description}

  CANDIDATO:
  - Carrera: ${candidate.career ?? 'No especificada'}
  - Habilidades técnicas: ${candidate.skills.length > 0 ? candidate.skills.join(', ') : 'No especificadas'}
  - Habilidades blandas: ${candidate.softSkills.length > 0 ? candidate.softSkills.join(', ') : 'No especificadas'}
  - Idiomas: ${languagesText}
  - Proyectos: ${projectsText}
  - Certificaciones: ${certsText}
  - Resumen: ${candidate.summary ?? 'No especificado'}
  - Modalidad disponible: ${candidate.workMode ?? 'No especificada'}

  INSTRUCCIONES:
  - Considera variaciones del mismo término como equivalentes (ej: Node.js = nodejs = NodeJS)
  - Valora la transferibilidad de habilidades entre áreas relacionadas
  - Ten en cuenta el contexto universitario colombiano
  - Sé justo con candidatos que tienen pocas experiencias pero buen perfil académico

  Responde ÚNICAMENTE con un JSON válido sin markdown ni texto adicional:
  {
    "score": número entre 0 y 100,
    "reasons": ["máximo 3 razones por las que es compatible"],
    "gaps": ["máximo 2 aspectos donde el candidato podría mejorar para esta vacante"]
  }`;

  return callGemini(prompt);
}