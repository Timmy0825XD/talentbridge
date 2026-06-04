import { PrismaClient, KeywordType } from '@prisma/client';
import { createUniversityWithAccount } from '../src/services/university-create.service';
import { createCareerRecord } from '../src/services/career.service';

const prisma = new PrismaClient();

const INITIAL_CAREERS = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Administración de Empresas',
  'Contaduría Pública',
  'Derecho',
  'Psicología',
  'Comunicación Social',
  'Medicina',
  'Enfermería',
  'Arquitectura',
  'Economía',
  'Mercadeo',
  'Diseño Gráfico',
  'Tecnología en Desarrollo de Software',
  'Ingeniería Mecánica',
  'Ingeniería Eléctrica',
  'Trabajo Social',
  'Educación',
  'Finanzas',
];

const INITIAL_UNIVERSITIES = [
  'Universidad Popular del Cesar',
  'Universidad Nacional de Colombia',
  'Universidad de Santander',
  'Fundación Universitaria del Área Andina',
  'Universidad Antonio Nariño',
  'Universidad Externado de Colombia',
  'Universidad Autónoma de Bucaramanga',
  'Universidad Mariana',
  'Corporación Universitaria Minuto de Dios',
  'Universidad Nacional Abierta y a Distancia',
  'Universidad Santo Tomás',
  'Fundación Universidad de Bogotá Jorge Tadeo Lozano',
  'Universidad del Norte',
  'Universidad de Medellín',
  'Universidad del Atlántico',
  'Universidad de Pamplona',
  'Fundación de Educación Superior UPARSISTEM',
];

const keywords = [
  // ── DESARROLLO WEB / SISTEMAS ─────────────────────────────────────────
  { name: 'javascript',     type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'typescript',     type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'python',         type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'java',           type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'kotlin',         type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'swift',          type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'c++',            type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'c#',             type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'php',            type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'go',             type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'rust',           type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'react',          type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'next.js',        type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'vue',            type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'angular',        type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'svelte',         type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'html',           type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'css',            type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'tailwind',       type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'node.js',        type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'express',        type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'fastapi',        type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'django',         type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'nestjs',         type: KeywordType.TECHNICAL, category: 'Desarrollo Web' },
  { name: 'postgresql',     type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'mysql',          type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'mongodb',        type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'redis',          type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'prisma',         type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'sql',            type: KeywordType.TECHNICAL, category: 'Bases de Datos' },
  { name: 'aws',            type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'gcp',            type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'azure',          type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'docker',         type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'kubernetes',     type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'linux',          type: KeywordType.TECHNICAL, category: 'Cloud y DevOps' },
  { name: 'git',            type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'github',         type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'jira',           type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'figma',          type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'postman',        type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'rest api',       type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'graphql',        type: KeywordType.TECHNICAL, category: 'Herramientas' },
  { name: 'react native',   type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'flutter',        type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'android',        type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'ios',            type: KeywordType.TECHNICAL, category: 'Desarrollo Móvil' },
  { name: 'machine learning', type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'deep learning',  type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'tensorflow',     type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'pytorch',        type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'pandas',         type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'numpy',          type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'power bi',       type: KeywordType.TECHNICAL, category: 'Data Science' },
  { name: 'tableau',        type: KeywordType.TECHNICAL, category: 'Data Science' },

  // ── DISEÑO ────────────────────────────────────────────────────────────
  { name: 'diseño gráfico', type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'illustrator',    type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'photoshop',      type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'indesign',       type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'ui/ux',          type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'after effects',  type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'premiere',       type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'branding',       type: KeywordType.TECHNICAL, category: 'Diseño' },
  { name: 'canva',          type: KeywordType.TECHNICAL, category: 'Diseño' },

  // ── ADMINISTRACIÓN Y NEGOCIOS ─────────────────────────────────────────
  { name: 'gestión de proyectos', type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'scrum',          type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'kanban',         type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'excel avanzado', type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'sap',            type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'marketing digital', type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'seo',            type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'crm',            type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'salesforce',     type: KeywordType.TECHNICAL, category: 'Administración' },
  { name: 'gestión financiera', type: KeywordType.TECHNICAL, category: 'Administración' },

  // ── CONTADURÍA ────────────────────────────────────────────────────────
  { name: 'contabilidad',   type: KeywordType.TECHNICAL, category: 'Contaduría' },
  { name: 'niif',           type: KeywordType.TECHNICAL, category: 'Contaduría' },
  { name: 'auditoría',      type: KeywordType.TECHNICAL, category: 'Contaduría' },
  { name: 'siigo',          type: KeywordType.TECHNICAL, category: 'Contaduría' },
  { name: 'tributaria',     type: KeywordType.TECHNICAL, category: 'Contaduría' },
  { name: 'dian',           type: KeywordType.TECHNICAL, category: 'Contaduría' },

  // ── DERECHO ───────────────────────────────────────────────────────────
  { name: 'derecho laboral', type: KeywordType.TECHNICAL, category: 'Derecho' },
  { name: 'derecho comercial', type: KeywordType.TECHNICAL, category: 'Derecho' },
  { name: 'contratos',      type: KeywordType.TECHNICAL, category: 'Derecho' },
  { name: 'litigios',       type: KeywordType.TECHNICAL, category: 'Derecho' },

  // ── INGENIERÍA CIVIL / INDUSTRIAL ─────────────────────────────────────
  { name: 'autocad',        type: KeywordType.TECHNICAL, category: 'Ingeniería Civil' },
  { name: 'revit',          type: KeywordType.TECHNICAL, category: 'Ingeniería Civil' },
  { name: 'lean manufacturing', type: KeywordType.TECHNICAL, category: 'Ingeniería Industrial' },
  { name: 'six sigma',      type: KeywordType.TECHNICAL, category: 'Ingeniería Industrial' },
  { name: 'logística',      type: KeywordType.TECHNICAL, category: 'Ingeniería Industrial' },

  // ── SALUD ─────────────────────────────────────────────────────────────
  { name: 'salud ocupacional', type: KeywordType.TECHNICAL, category: 'Salud' },
  { name: 'sgsst',          type: KeywordType.TECHNICAL, category: 'Salud' },
  { name: 'primeros auxilios', type: KeywordType.TECHNICAL, category: 'Salud' },

  // ── COMUNICACIÓN ──────────────────────────────────────────────────────
  { name: 'redacción',      type: KeywordType.TECHNICAL, category: 'Comunicación' },
  { name: 'community manager', type: KeywordType.TECHNICAL, category: 'Comunicación' },
  { name: 'copywriting',    type: KeywordType.TECHNICAL, category: 'Comunicación' },
  { name: 'relaciones públicas', type: KeywordType.TECHNICAL, category: 'Comunicación' },

  // ── EDUCACIÓN ─────────────────────────────────────────────────────────
  { name: 'pedagogía',      type: KeywordType.TECHNICAL, category: 'Educación' },
  { name: 'didáctica',      type: KeywordType.TECHNICAL, category: 'Educación' },
  { name: 'e-learning',     type: KeywordType.TECHNICAL, category: 'Educación' },
  { name: 'moodle',         type: KeywordType.TECHNICAL, category: 'Educación' },

  // ── HABILIDADES BLANDAS ───────────────────────────────────────────────
  { name: 'liderazgo',           type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'trabajo en equipo',   type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'comunicación',        type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'resolución de problemas', type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'pensamiento crítico', type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'creatividad',         type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'adaptabilidad',       type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'gestión del tiempo',  type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'proactividad',        type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'empatía',             type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'negociación',         type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'toma de decisiones',  type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'orientación al logro', type: KeywordType.SOFT, category: 'Habilidades Blandas' },
  { name: 'inteligencia emocional', type: KeywordType.SOFT, category: 'Habilidades Blandas' },

  // ── IDIOMAS ───────────────────────────────────────────────────────────
  { name: 'inglés',    type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'english',   type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'francés',   type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'portugués', type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'alemán',    type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'mandarín',  type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'b1',        type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'b2',        type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'c1',        type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'toefl',     type: KeywordType.LANGUAGE, category: 'Idiomas' },
  { name: 'ielts',     type: KeywordType.LANGUAGE, category: 'Idiomas' },
];

async function main() {
  console.log('Seeding keywords...');

  for (const keyword of keywords) {
    await prisma.keyword.upsert({
      where: { name: keyword.name },
      update: {},
      create: keyword,
    });
  }

  await prisma.globalRankConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      skillsWeight: 0.20,
      experienceWeight: 0.20,
      educationWeight: 0.20,
      certsWeight: 0.10,
      reputationWeight: 0.10,
      languagesWeight: 0.05,
      completionWeight: 0.20,
    },
  });

  console.log(`✅ ${keywords.length} keywords insertadas correctamente.`);
  console.log('✅ GlobalRankConfig inicializado.');

  const credentialsLog: { name: string; email: string; password: string }[] = [];

  for (const name of INITIAL_CAREERS) {
    const existingCareer = await prisma.career.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existingCareer) {
      console.log(`⏭️  Carrera ya existe: ${name}`);
      continue;
    }
    await createCareerRecord(name);
    console.log(`✅ Carrera creada: ${name}`);
  }

  const unlinked = await prisma.candidateProfile.count({
    where: { OR: [{ universityId: null }, { careerId: null }] },
  });
  if (unlinked > 0) {
    console.log(`⚠️  Perfiles sin universityId o careerId: ${unlinked} (deben actualizar perfil)`);
  }

  for (const name of INITIAL_UNIVERSITIES) {
    const existing = await prisma.university.findUnique({ where: { name } });
    if (existing) {
      console.log(`⏭️  Universidad ya existe: ${name}`);
      continue;
    }

    const result = await createUniversityWithAccount(name);
    credentialsLog.push({
      name: result.university.name,
      email: result.generatedCredentials.email,
      password: result.generatedCredentials.password,
    });
    console.log(`✅ Universidad creada: ${name}`);
  }

  if (credentialsLog.length > 0) {
    console.log('\n📋 Credenciales generadas (solo desarrollo):');
    console.table(credentialsLog);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());