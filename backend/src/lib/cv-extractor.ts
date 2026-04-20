// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import { prisma } from './prisma';
import { supabase } from './supabase';
import { KeywordType } from '@prisma/client';

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

export interface ExtractedKeywords {
  technical: string[];
  soft: string[];
  languages: string[];
}

export async function extractCvKeywords(cvUrl: string): Promise<ExtractedKeywords> {
  try {
    // Descargar y parsear el PDF
    const buffer = await downloadPdfFromSupabase(cvUrl);
    const result = await pdfParse(buffer);
    const text = result.text.toLowerCase();

    // Cargar keywords activas desde la BD
    const keywords = await prisma.keyword.findMany({
      where: { isActive: true },
    });

    // Clasificar por tipo
    const technical: string[] = [];
    const soft: string[] = [];
    const languages: string[] = [];

    for (const keyword of keywords) {
      if (text.includes(keyword.name.toLowerCase())) {
        if (keyword.type === KeywordType.TECHNICAL) technical.push(keyword.name);
        else if (keyword.type === KeywordType.SOFT) soft.push(keyword.name);
        else if (keyword.type === KeywordType.LANGUAGE) languages.push(keyword.name);
      }
    }

    console.log('Keywords técnicas:', technical);
    console.log('Habilidades blandas:', soft);
    console.log('Idiomas:', languages);

    return { technical, soft, languages };
  } catch (err: any) {
    console.error('cv-extractor error:', err.message);
    return { technical: [], soft: [], languages: [] };
  }
}