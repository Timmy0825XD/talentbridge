import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CompatibilityResult {
  score: number;
  reasons: string[];
  gaps: string[];
}

export interface CvExtractionResult {
  skills: string[];
  softSkills: string[];
  languages: { language: string; level: string }[];
  certifications: { name: string; issuer?: string; year?: number }[];
  projects: { title: string; description?: string; url?: string }[];
  summary: string | null;
  universityName: string | null;
  careerName: string | null;
}

// ─── HELPER: llamar a Gemini con retry ───────────────────────────────────────

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY no definida');
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
}

async function callGemini(prompt: string, attempt = 1): Promise<string> {
  const model = getGeminiModel();

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    const isRateLimit = err.status === 429 || err.message?.includes('429');
    if (isRateLimit && attempt < 3) {
      const waitMs = attempt * 5000;
      console.log(`Rate limit. Reintentando en ${waitMs / 1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      return callGemini(prompt, attempt + 1);
    }
    throw err;
  }
}

// ─── FUNCIÓN 1: Compatibilidad candidato-vacante ──────────────────────────────

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
  try {
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

Responde ÚNICAMENTE con JSON válido:
{
  "score": número entre 0 y 100,
  "reasons": ["máximo 3 razones concretas por las que es compatible"],
  "gaps": ["máximo 2 aspectos específicos donde el candidato podría mejorar para esta vacante"]
}`;

    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);

    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      reasons: parsed.reasons ?? [],
      gaps: parsed.gaps ?? [],
    };
  } catch (err: any) {
    console.log('Gemini scoreCompatibility error:', err.message);
    return { score: 50, reasons: [], gaps: [] };
  }
}

// ─── FUNCIÓN 2: Extracción inteligente del CV ─────────────────────────────────

export async function extractCvProfile(
  cvText: string,
  existingKeywords: { name: string; type: string }[]
): Promise<CvExtractionResult> {
  try {
    // Convertir texto del PDF a formato limpio reduciendo tokens
    const cleanText = cvText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,@()/áéíóúÁÉÍÓÚñÑ]/g, ' ')
      .trim()
      .substring(0, 4000); // Limitar a 4000 chars para reducir tokens

    // Pasar las keywords existentes para que la IA normalice contra ellas
    const technicalKeywords = existingKeywords
      .filter(k => k.type === 'TECHNICAL')
      .map(k => k.name)
      .join(', ');

    const softKeywords = existingKeywords
      .filter(k => k.type === 'SOFT')
      .map(k => k.name)
      .join(', ');

    const languageKeywords = existingKeywords
      .filter(k => k.type === 'LANGUAGE')
      .map(k => k.name)
      .join(', ');

    const prompt = `
Analiza este CV y extrae información estructurada.

KEYWORDS TÉCNICAS EXISTENTES EN EL SISTEMA: ${technicalKeywords}
HABILIDADES BLANDAS EXISTENTES: ${softKeywords}
IDIOMAS EXISTENTES: ${languageKeywords}

REGLAS CRÍTICAS:
1. Para habilidades técnicas y blandas: si encuentras una habilidad que ES EQUIVALENTE a una existente en el sistema (ej: "nodejs" = "node.js", "JS" = "javascript"), devuelve el nombre EXACTO de la existente.
2. Si encuentras una habilidad que NO existe ni tiene equivalente en el sistema, devuélvela tal como aparece en el CV — será agregada como nueva.
3. Para idiomas: normaliza al nombre completo (ej: "inglés", "francés").
4. Infiere el nivel del idioma del contexto si no está explícito (A1-C2 o "Nativo").
5. Extrae proyectos con su título, descripción breve y URL si aparece.
6. Genera un resumen profesional breve (2-3 oraciones) basado en el perfil si el CV no tiene uno claro.

CV A ANALIZAR:
${cleanText}

Responde ÚNICAMENTE con JSON válido:
{
  "skills": ["lista de habilidades técnicas normalizadas"],
  "softSkills": ["lista de habilidades blandas normalizadas"],
  "languages": [{"language": "nombre", "level": "nivel"}],
  "certifications": [{"name": "nombre", "issuer": "entidad o null", "year": número o null}],
  "projects": [{"title": "título", "description": "descripción breve", "url": "url o null"}],
  "summary": "resumen profesional generado o null",
  "universityName": "nombre de la universidad donde estudió o null",
  "careerName": "nombre de la carrera o programa académico o null"
}`;

    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);

    return {
      skills: parsed.skills ?? [],
      softSkills: parsed.softSkills ?? [],
      languages: parsed.languages ?? [],
      certifications: parsed.certifications ?? [],
      projects: parsed.projects ?? [],
      summary: parsed.summary ?? null,
      universityName: parsed.universityName ?? null,
      careerName: parsed.careerName ?? null,
    };
  } catch (err: any) {
    console.log('Gemini extractCvProfile error:', err.message);
    return {
      skills: [],
      softSkills: [],
      languages: [],
      certifications: [],
      projects: [],
      summary: null,
      universityName: null,
      careerName: null,
    };
  }
}