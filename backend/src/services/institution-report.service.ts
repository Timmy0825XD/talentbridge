import { getInstitutionProfileOrThrow } from '../lib/access/profile-access';
import { institutionCandidatesReportQuerySchema } from '../lib/validators/institution.validators';
import { renderPdf, TB } from '../lib/pdf/talentbridge-pdf';
import {
  getInstitutionAnalytics,
  getInstitutionDashboard,
  listInstitutionCandidates,
  type InstitutionEmploymentStatus,
} from './institution.service';
import type { InstitutionCandidatesQuery } from '../lib/validators/institution.validators';

const EXPORT_CANDIDATE_LIMIT = 200;

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Estudiante',
  GRADUATE: 'Egresado',
};

const STATUS_LABEL: Record<InstitutionEmploymentStatus, string> = {
  incomplete_profile: 'Perfil incompleto',
  no_applications: 'Sin postular',
  in_process: 'En proceso',
  hired: 'Contratado',
};

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const mi = parseInt(m, 10) - 1;
  return `${MONTH_SHORT[mi] ?? m} ${y?.slice(2) ?? ''}`;
}

function filterSummary(query: InstitutionCandidatesQuery): string {
  const parts: string[] = [];
  if (query.role) parts.push(`Rol: ${ROLE_LABEL[query.role] ?? query.role}`);
  if (query.career) parts.push(`Carrera: ${query.career}`);
  if (query.search) parts.push(`Búsqueda: "${query.search}"`);
  if (query.status && query.status !== 'all') {
    parts.push(`Estado: ${STATUS_LABEL[query.status as InstitutionEmploymentStatus] ?? query.status}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Sin filtros aplicados (todos los vinculados)';
}

async function fetchCandidatesForExport(
  userId: string,
  query: InstitutionCandidatesQuery
) {
  return listInstitutionCandidates(userId, {
    role: query.role,
    career: query.career,
    status: query.status,
    search: query.search,
    page: 1,
    limit: EXPORT_CANDIDATE_LIMIT,
  });
}

export async function generateInstitutionCandidatesPdf(
  userId: string,
  rawQuery: unknown
): Promise<Buffer> {
  const parsed = institutionCandidatesReportQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw new Error('INVALID_QUERY');

  const profile = await getInstitutionProfileOrThrow(userId);
  const { items, total, limit } = await fetchCandidatesForExport(userId, parsed.data);
  const dashboard = await getInstitutionDashboard(userId);

  const statusCounts = {
    incomplete_profile: 0,
    no_applications: 0,
    in_process: 0,
    hired: 0,
  } as Record<InstitutionEmploymentStatus, number>;
  for (const row of items) {
    statusCounts[row.employmentStatus] += 1;
  }

  const truncated = total > limit;

  return renderPdf(pdf => {
    pdf.drawCoverHeader({
      reportType: 'Reporte institucional',
      title: 'Estudiantes y egresados vinculados',
      subtitle: profile.institutionName,
      meta: [
        { label: 'Total en plataforma', value: String(total) },
        { label: 'Registros en este PDF', value: String(items.length) },
        { label: 'Filtros', value: filterSummary(parsed.data) },
      ],
    });

    pdf.drawExecutiveSummary([
      `Este reporte presenta el estado de empleabilidad de los perfiles vinculados a ${profile.institutionName} en TalentBridge.`,
      `En la plataforma hay ${dashboard.metrics.activeStudents} estudiantes y ${dashboard.metrics.activeGraduates} egresados activos; ${dashboard.funnel.linked} perfiles vinculados al catálogo institucional.`,
      `La tasa de inserción (egresados con al menos un contrato completado) es del ${dashboard.metrics.insertionRatePercent}% según los datos actuales del panel institucional.`,
      truncated
        ? `Nota: el listado detallado incluye los primeros ${limit} registros según los filtros aplicados. Use filtros más específicos o exporte por segmentos para cubrir los ${total} vinculados.`
        : 'El listado detallado incluye todos los registros que coinciden con los filtros seleccionados.',
    ]);

    pdf.drawKpiRow([
      { label: 'Vinculados', value: String(dashboard.funnel.linked) },
      { label: 'Perfil completo', value: String(dashboard.funnel.profileComplete) },
      { label: 'Han postulado', value: String(dashboard.funnel.hasApplied) },
      { label: 'Contratados', value: String(dashboard.funnel.hasCompletedContract) },
    ]);

    pdf.drawSection('Distribución en esta exportación');
    pdf.drawKeyValueGrid([
      { label: 'Perfil incompleto', value: String(statusCounts.incomplete_profile) },
      { label: 'Sin postular', value: String(statusCounts.no_applications) },
      { label: 'En proceso', value: String(statusCounts.in_process) },
      { label: 'Contratados', value: String(statusCounts.hired) },
    ]);

    pdf.drawSection('Detalle de vinculados');
    pdf.drawTable(
      [
        { header: 'Nombre', width: 120 },
        { header: 'Rol', width: 55 },
        { header: 'Carrera', width: 90 },
        { header: 'Grad.', width: 40, align: 'center' },
        { header: 'Score', width: 40, align: 'center' },
        { header: 'Post.', width: 35, align: 'center' },
        { header: 'Estado', width: 85 },
      ],
      items.map(r => [
        r.fullName ?? 'Sin nombre',
        ROLE_LABEL[r.role] ?? r.role,
        r.career ?? '—',
        r.graduationYear != null ? String(r.graduationYear) : '—',
        r.totalScore != null ? String(Math.round(r.totalScore)) : '—',
        String(r.applicationCount),
        STATUS_LABEL[r.employmentStatus],
      ])
    );

    pdf.drawSection('Recomendaciones para la institución');
    pdf.drawBulletList([
      'Priorizar acompañamiento a perfiles con estado "Perfil incompleto" para mejorar visibilidad ante empresas.',
      'Promover postulación activa en vacantes alineadas con las habilidades más demandadas del mercado (ver reporte de empleabilidad).',
      'Dar seguimiento a egresados "En proceso" con mentorías de entrevista y preparación de entregables.',
      'Celebrar y documentar casos "Contratados" como casos de éxito para atraer más empresas al ecosistema.',
    ]);

    pdf.drawParagraph(
      'Datos extraídos de TalentBridge. Los estados se calculan automáticamente según completitud del perfil, postulaciones y contratos cerrados.',
      { color: TB.subtle }
    );
  });
}

export async function generateInstitutionAnalyticsPdf(userId: string): Promise<Buffer> {
  const profile = await getInstitutionProfileOrThrow(userId);
  const dashboard = await getInstitutionDashboard(userId);
  const analytics = await getInstitutionAnalytics(userId);

  const totalInsertions = analytics.insertionTrend.reduce((s, i) => s + i.count, 0);
  const totalApplications = analytics.applicationsTrend.reduce((s, i) => s + i.count, 0);

  return renderPdf(pdf => {
    pdf.drawCoverHeader({
      reportType: 'Reporte de empleabilidad',
      title: 'Métricas y tendencias',
      subtitle: profile.institutionName,
      meta: [
        { label: 'Periodo tendencias', value: 'Últimos 12 meses' },
        {
          label: 'Score promedio vinculados',
          value:
            analytics.avgGraduateScore != null
              ? String(analytics.avgGraduateScore)
              : 'Sin datos',
        },
        { label: 'Tasa inserción global', value: `${dashboard.metrics.insertionRatePercent}%` },
      ],
    });

    pdf.drawExecutiveSummary([
      `Análisis consolidado de empleabilidad para ${profile.institutionName}, con base en perfiles vinculados, postulaciones y contratos cerrados en TalentBridge.`,
      `En los últimos 12 meses se registraron ${totalApplications} postulaciones y ${totalInsertions} contratos completados (inserciones laborales vía plataforma).`,
      analytics.avgGraduateScore != null
        ? `El puntaje promedio de perfil de los vinculados con score calculado es ${analytics.avgGraduateScore}/100, indicador de preparación visible para empresas.`
        : 'Aún no hay suficientes puntajes de perfil calculados para un promedio representativo.',
    ]);

    pdf.drawKpiRow([
      {
        label: 'Postulaciones (12m)',
        value: String(totalApplications),
      },
      {
        label: 'Contratos cerrados (12m)',
        value: String(totalInsertions),
      },
      {
        label: 'Tasa inserción',
        value: `${dashboard.metrics.insertionRatePercent}%`,
        hint: 'Egresados con contrato',
      },
      {
        label: 'Score promedio',
        value:
          analytics.avgGraduateScore != null ? String(analytics.avgGraduateScore) : '—',
        hint: 'Perfil 0–100',
      },
    ]);

    pdf.drawSection('Indicadores por carrera');
    if (analytics.byCareer.length > 0) {
      pdf.drawTable(
        [
          { header: 'Carrera', width: 130 },
          { header: 'Vinculados', width: 55, align: 'center' },
          { header: 'Contratados', width: 65, align: 'center' },
          { header: 'Tasa inserción', width: 75, align: 'right' },
        ],
        analytics.byCareer.map(c => [
          c.career,
          String(c.linked),
          String(c.withCompletedContract),
          `${c.insertionRatePercent.toFixed(1)}%`,
        ])
      );
    } else {
      pdf.drawParagraph('No hay vinculados con carrera registrada para segmentar métricas.');
    }

    pdf.drawSection('Contratos cerrados por mes');
    pdf.drawTrendBars(
      analytics.insertionTrend.map(i => ({
        label: formatMonthLabel(i.month),
        value: i.count,
      }))
    );

    pdf.drawSection('Postulaciones por mes');
    pdf.drawTrendBars(
      analytics.applicationsTrend.map(i => ({
        label: formatMonthLabel(i.month),
        value: i.count,
      })),
      TB.primary
    );

    pdf.drawSection('Áreas de contratación');
    if (analytics.topHiringAreas.length > 0) {
      const max = analytics.topHiringAreas[0]?.count ?? 1;
      pdf.drawTable(
        [
          { header: 'Área', width: 200 },
          { header: 'Contratos', width: 60, align: 'center' },
          { header: '% del total', width: 70, align: 'right' },
        ],
        analytics.topHiringAreas.map(a => [
          a.area,
          String(a.count),
          `${Math.round((a.count / max) * 100)}% rel.`,
        ])
      );
    } else {
      pdf.drawParagraph(
        'Aún no hay contratos completados registrados para identificar áreas de contratación dominantes.'
      );
    }

    if (dashboard.skillsGap.length > 0) {
      pdf.drawSection('Brecha de habilidades (mercado vs. vinculados)');
      pdf.drawParagraph(
        'Habilidades con mayor demanda en vacantes activas que aún no aparecen con frecuencia en los perfiles vinculados:'
      );
      pdf.drawBulletList(
        dashboard.skillsGap.map(
          g => `${g.skill} — demandada en ${g.marketCount} vacante(s) analizadas`
        )
      );
      pdf.drawHighlightBox(
        'Acción sugerida',
        'Incorporar estas competencias en talleres, microcredenciales o rutas de aprendizaje recomendadas a estudiantes y egresados.',
        'info'
      );
    }

    if (dashboard.marketDemandSkills.length > 0) {
      pdf.drawSection('Top habilidades demandadas en el mercado');
      pdf.drawBulletList(
        dashboard.marketDemandSkills
          .slice(0, 8)
          .map(s => `${s.skill} (${s.count} menciones en vacantes activas)`)
      );
    }

    pdf.drawSection('Conclusiones');
    pdf.drawBulletList([
      'Monitorear mensualmente la tendencia de postulaciones vs. contratos cerrados para evaluar efectividad del vínculo universidad–empresa.',
      'Enfocar programas de empleabilidad en carreras con menor tasa de inserción respecto al número de vinculados.',
      'Cerrar brechas de habilidades identificadas para aumentar la competitividad de los perfiles en el ranking de TalentBridge.',
    ]);

    pdf.drawParagraph(
      'Indicadores calculados en tiempo real desde la base de datos de TalentBridge. Las referencias de mercado de habilidades provienen de vacantes activas en la plataforma.',
      { color: TB.subtle }
    );
  });
}
