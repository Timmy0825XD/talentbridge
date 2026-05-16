// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import { supabase } from './supabase';
import { prisma } from './prisma';
import { extractCvProfile, CvExtractionResult } from './gemini';
import { KeywordType } from '@prisma/client';

// ─── DESCARGAR PDF DESDE SUPABASE ─────────────────────────────────────────────

async function downloadPdfFromSupabase(cvUrl: string): Promise<Buffer> {
  const fileName = cvUrl.split('/').pop();
  if (!fileName) throw new Error('CV_URL_INVALID');

  const { data, error } = await supabase.storage
    .from('cvs')
    .download(fileName);

  if (error || !data) throw new Error('CV_DOWNLOAD_FAILED');

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── NORMALIZAR KEYWORDS CONTRA LA BD ────────────────────────────────────────
// Para cada skill extraída por Gemini:
// 1. Si existe en BD (exact o equivalente) → usar el nombre de la BD
// 2. Si no existe → crear en BD como nueva keyword activa

async function normalizeAndSyncKeywords(
  extractedSkills: string[],
  type: KeywordType,
  category: string
): Promise<string[]> {
  const normalized: string[] = [];

  // Cargar todas las keywords del tipo correspondiente
  const existingKeywords = await prisma.keyword.findMany({
    where: { type, isActive: true },
  });

  for (const skill of extractedSkills) {
    const skillLower = skill.toLowerCase().trim();
    if (!skillLower) continue;

    // Buscar coincidencia exacta o equivalente en la BD
    const match = existingKeywords.find(k =>
      k.name.toLowerCase() === skillLower ||
      // Normalización de variaciones comunes
      k.name.toLowerCase().replace(/[.\-\s]/g, '') === skillLower.replace(/[.\-\s]/g, '')
    );

    if (match) {
      // Usar el nombre canónico de la BD
      normalized.push(match.name);
    } else {
      // Agregar nueva keyword a la BD
      try {
        const newKeyword = await prisma.keyword.create({
          data: {
            name: skill.trim(),
            type,
            category,
            isActive: true,
          },
        });
        normalized.push(newKeyword.name);
        existingKeywords.push(newKeyword); // Agregar al cache local
        console.log(`Nueva keyword agregada a BD: "${skill}" (${type})`);
      } catch {
        // Si ya existe por race condition simplemente la usamos
        normalized.push(skill.trim());
      }
    }
  }

  // Eliminar duplicados
  return [...new Set(normalized)];
}

// ─── FUNCIÓN PRINCIPAL DE EXTRACCIÓN ─────────────────────────────────────────

export async function extractCvIntelligent(cvUrl: string): Promise<CvExtractionResult> {
  try {
    // 1. Descargar el PDF
    const buffer = await downloadPdfFromSupabase(cvUrl);

    // 2. Extraer texto plano con pdf-parse
    const result = await pdfParse(buffer);
    const rawText = result.text;

    if (!rawText || rawText.trim().length < 50) {
      console.log('PDF sin texto suficiente para extraer');
      return { skills: [], softSkills: [], languages: [], certifications: [], projects: [], summary: null };
    }

    // 3. Cargar keywords existentes para que Gemini normalice contra ellas
    const existingKeywords = await prisma.keyword.findMany({
      where: { isActive: true },
      select: { name: true, type: true },
    });

    // 4. Gemini extrae y normaliza contra las keywords existentes
    const extracted = await extractCvProfile(rawText, existingKeywords);

    // 5. Normalizar y sincronizar cada tipo con la BD
    const [normalizedSkills, normalizedSoftSkills] = await Promise.all([
      normalizeAndSyncKeywords(extracted.skills, KeywordType.TECHNICAL, 'General'),
      normalizeAndSyncKeywords(extracted.softSkills, KeywordType.SOFT, 'Habilidades Blandas'),
    ]);

    console.log(`CV Intelligence completado:`);
    console.log(`  Técnicas: ${normalizedSkills.length} (${normalizedSkills.slice(0, 3).join(', ')}...)`);
    console.log(`  Blandas: ${normalizedSoftSkills.length}`);
    console.log(`  Idiomas: ${extracted.languages.length}`);
    console.log(`  Proyectos: ${extracted.projects.length}`);
    console.log(`  Certificaciones: ${extracted.certifications.length}`);

    return {
      skills: normalizedSkills,
      softSkills: normalizedSoftSkills,
      languages: extracted.languages,
      certifications: extracted.certifications,
      projects: extracted.projects,
      summary: extracted.summary,
    };
  } catch (err: any) {
    console.log('extractCvIntelligent error:', err.message);
    return { skills: [], softSkills: [], languages: [], certifications: [], projects: [], summary: null };
  }
}

// Mantener compatibilidad con el extractor anterior
export interface ExtractedKeywords {
  technical: string[];
  soft: string[];
  languages: string[];
}

export async function extractCvKeywords(cvUrl: string): Promise<ExtractedKeywords> {
  const result = await extractCvIntelligent(cvUrl);
  return {
    technical: result.skills,
    soft: result.softSkills,
    languages: result.languages.map(l => l.language),
  };
}