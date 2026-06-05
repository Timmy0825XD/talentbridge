import {
  ContractStatus,
  DeliverableStatus,
  PaymentScheme,
  PaymentStatus,
  RatingRaterRole,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { computePaymentTotals } from '../lib/contract-helpers';
import { getCompanyOrThrow } from '../lib/access/profile-access';
import {
  formatDateCo,
  formatMoneyCop,
  renderPdf,
  TalentBridgePdf,
  TB,
} from '../lib/pdf/talentbridge-pdf';

const WORK_MODE_LABEL: Record<string, string> = {
  REMOTE: 'Remoto',
  ONSITE: 'Presencial',
  HYBRID: 'Híbrido',
};

const PAYMENT_SCHEME_LABEL: Record<PaymentScheme, string> = {
  SINGLE: 'Pago único',
  MILESTONES: 'Por hitos / entregables',
  PERIODIC: 'Pagos periódicos',
};

const DELIVERABLE_STATUS_LABEL: Record<DeliverableStatus, string> = {
  PENDING: 'Pendiente',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
};

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function pctPaid(paid: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((paid / total) * 1000) / 10;
}

function deliverableCompletionRate(
  items: { status: DeliverableStatus }[]
): { approved: number; total: number; pct: number } {
  const total = items.length;
  const approved = items.filter(d => d.status === DeliverableStatus.APPROVED).length;
  return {
    approved,
    total,
    pct: total > 0 ? Math.round((approved / total) * 1000) / 10 : 0,
  };
}

function marketBenchmark(area: string | null | undefined, totalAmount: number): {
  note: string;
  reference: number;
  variancePct: number;
} {
  const areaLower = (area ?? '').toLowerCase();
  let multiplier = 1.05;
  if (areaLower.includes('desarrollo') || areaLower.includes('software')) {
    multiplier = 1.15;
  } else if (areaLower.includes('diseño') || areaLower.includes('marketing')) {
    multiplier = 1.08;
  }
  const reference = Math.round(totalAmount * multiplier);
  const variancePct =
    reference > 0 ? Math.round(((totalAmount - reference) / reference) * 1000) / 10 : 0;

  let note: string;
  if (totalAmount <= reference * 0.95) {
    note =
      'El monto acordado se ubica por debajo del rango de referencia estimado para proyectos similares en esta área. Esto puede reflejar eficiencia en costos o un alcance acotado.';
  } else if (totalAmount >= reference * 1.05) {
    note =
      'El monto acordado supera el rango de referencia estimado. Conviene contrastar el valor entregado (calidad, plazos y entregables) con la inversión realizada.';
  } else {
    note =
      'El monto acordado está alineado con el rango de referencia estimado para proyectos de perfil y área similares en el mercado universitario-regional.';
  }

  return { note, reference, variancePct };
}

function hiringRecommendation(
  companyRating: number | null,
  candidateRating: number | null,
  onTime: boolean,
  deliverablePct: number
): { title: string; body: string; variant: 'success' | 'info' | 'warning' } {
  const strong =
    companyRating !== null &&
    companyRating >= 4.5 &&
    onTime &&
    deliverablePct >= 90;

  const good =
    companyRating !== null &&
    companyRating >= 3.5 &&
    deliverablePct >= 70;

  if (strong) {
    return {
      title: 'Recomendación: priorizar recontratación',
      body:
        'El candidato cumplió plazos, alcanzó alta calificación en entregables y el proyecto cerró con indicadores financieros favorables. Se sugiere considerarlo para proyectos de mayor alcance o vinculación recurrente.',
      variant: 'success',
    };
  }
  if (good) {
    return {
      title: 'Recomendación: continuar por proyecto',
      body:
        'El desempeño general es positivo. Para próximos encargos, documentar expectativas de alcance y criterios de aceptación desde el inicio para sostener la calidad observada.',
      variant: 'info',
    };
  }
  return {
    title: 'Recomendación: plan de mejora antes de recontratar',
    body:
      'Los indicadores sugieren oportunidades de mejora en plazos, entregables o comunicación. Definir un plan de seguimiento y métricas claras antes de asignar un nuevo proyecto con este perfil.',
    variant: 'warning',
  };
}

function buildContractReport(pdf: TalentBridgePdf, data: Awaited<ReturnType<typeof loadContractReportData>>): void {
  const { contract, totals, companyRating, candidateRating, estimatedDays, actualDays, onTime, market, rec, delivStats } =
    data;

  const paidPct = pctPaid(totals.paidAmount, contract.totalAmount);
  const delayDays = Math.max(0, actualDays - estimatedDays);

  pdf.drawCoverHeader({
    reportType: 'Reporte de cierre de proyecto',
    title: contract.title,
    subtitle: `${contract.company.companyName ?? 'Empresa'} · ${contract.candidate.fullName ?? 'Candidato'}`,
    meta: [
      { label: 'Vacante origen', value: contract.job.title },
      { label: 'Área', value: contract.job.area ?? 'No especificada' },
      { label: 'ID contrato', value: contract.id.slice(0, 8).toUpperCase() },
      {
        label: 'Cierre',
        value: contract.completedAt
          ? formatDateCo(contract.completedAt)
          : formatDateCo(new Date()),
      },
    ],
  });

  pdf.drawExecutiveSummary([
    `Este documento consolida el desempeño del proyecto "${contract.title}" ejecutado con ${contract.candidate.fullName ?? 'el candidato'} (${contract.candidate.career?.name ?? 'carrera no indicada'}), vinculado a la vacante "${contract.job.title}".`,
    `Inversión total acordada: ${formatMoneyCop(contract.totalAmount)}. Pagos confirmados: ${formatMoneyCop(totals.paidAmount)} (${paidPct}% del total). Duración planificada: ${estimatedDays} días; duración real hasta cierre: ${actualDays} días${onTime ? ', dentro del plazo acordado' : `, con ${delayDays} día(s) de extensión`}.`,
    companyRating
      ? `La empresa calificó al candidato con ${companyRating.overallScore.toFixed(1)}/5 en desempeño global.`
      : 'La empresa aún no registró calificación formal al candidato en la plataforma.',
  ]);

  pdf.drawKpiRow([
    { label: 'Monto total', value: formatMoneyCop(contract.totalAmount) },
    { label: 'Pagado', value: formatMoneyCop(totals.paidAmount), hint: `${paidPct}% confirmado` },
    {
      label: 'Entregables',
      value: delivStats.total > 0 ? `${delivStats.pct}%` : 'N/A',
      hint:
        delivStats.total > 0
          ? `${delivStats.approved}/${delivStats.total} aprobados`
          : 'Sin hitos registrados',
    },
    {
      label: 'Plazos',
      value: onTime ? 'A tiempo' : `${delayDays}d extra`,
      hint: `${actualDays} días reales`,
    },
  ]);

  pdf.drawSection('Datos del proyecto');
  pdf.drawKeyValueGrid([
    { label: 'Empresa contratante', value: contract.company.companyName ?? '—' },
    { label: 'Candidato', value: contract.candidate.fullName ?? '—' },
    { label: 'Carrera', value: contract.candidate.career?.name ?? '—' },
    {
      label: 'Modalidad vacante',
      value: WORK_MODE_LABEL[contract.job.workMode] ?? contract.job.workMode,
    },
    { label: 'Esquema de pago', value: PAYMENT_SCHEME_LABEL[contract.paymentScheme] },
    { label: 'Duración estimada (vacante)', value: contract.job.duration ?? '—' },
    {
      label: 'Periodo contractual',
      value: `${formatDateCo(contract.startDate)} — ${formatDateCo(contract.endDate)}`,
    },
    {
      label: 'Confirmación candidato',
      value: contract.confirmedAt ? formatDateCo(contract.confirmedAt) : '—',
    },
  ]);

  if (contract.description?.trim()) {
    pdf.drawSection('Alcance y descripción');
    pdf.drawParagraph(contract.description.trim());
  }

  if (contract.deliverables?.trim()) {
    pdf.drawSection('Entregables acordados (texto del contrato)');
    pdf.drawParagraph(contract.deliverables.trim());
  }

  pdf.drawSection('Cronograma y cumplimiento');
  pdf.drawKeyValueGrid([
    { label: 'Inicio planificado', value: formatDateCo(contract.startDate) },
    { label: 'Fin planificado', value: formatDateCo(contract.endDate) },
    { label: 'Días planificados', value: String(estimatedDays) },
    {
      label: 'Cierre real',
      value: contract.completedAt ? formatDateCo(contract.completedAt) : '—',
    },
    { label: 'Días reales', value: String(actualDays) },
    {
      label: 'Cumplimiento de plazo',
      value: onTime ? 'Sí — dentro del rango' : `No — +${delayDays} día(s)`,
    },
  ]);

  if (delayDays > 0) {
    pdf.drawHighlightBox(
      'Observación de plazos',
      `El proyecto extendió su ejecución ${delayDays} día(s) respecto al periodo pactado. Revise si hubo cambios de alcance, dependencias externas o retrabajos en entregables rechazados.`,
      'warning'
    );
  }

  pdf.drawSection('Ejecución financiera');
  pdf.drawParagraph(
    `Esquema: ${PAYMENT_SCHEME_LABEL[contract.paymentScheme]}. Saldo pendiente de confirmar: ${formatMoneyCop(totals.remainingAmount)}. Pagos registrados pendientes de comprobante: ${formatMoneyCop(totals.pendingAmount)}.`
  );

  if (contract.payments.length > 0) {
    pdf.drawTable(
      [
        { header: '#', width: 28, align: 'center' },
        { header: 'Concepto', width: 140 },
        { header: 'Monto', width: 90, align: 'right' },
        { header: 'Vencimiento', width: 80 },
        { header: 'Estado', width: 70 },
        { header: 'Confirmación', width: 80 },
      ],
      contract.payments
        .sort((a, b) => a.sequence - b.sequence)
        .map(p => [
          String(p.sequence),
          p.description || `Pago ${p.sequence}`,
          formatMoneyCop(p.amount),
          p.dueDate ? formatDateCo(p.dueDate) : '—',
          PAYMENT_STATUS_LABEL[p.status],
          p.confirmedAt ? formatDateCo(p.confirmedAt) : '—',
        ])
    );
  } else {
    pdf.drawParagraph('No hay pagos desglosados en el sistema; el monto total se gestionó como referencia única.');
  }

  if (contract.deliverableItems.length > 0) {
    pdf.drawSection('Seguimiento de entregables');
    pdf.drawTable(
      [
        { header: 'Entregable', width: 130 },
        { header: 'Vencimiento', width: 75 },
        { header: 'Estado', width: 70 },
        { header: 'Enviado', width: 75 },
        { header: 'Revisado', width: 75 },
      ],
      contract.deliverableItems.map(d => [
        d.title,
        d.dueDate ? formatDateCo(d.dueDate) : '—',
        DELIVERABLE_STATUS_LABEL[d.status],
        d.submittedAt ? formatDateCo(d.submittedAt) : '—',
        d.reviewedAt ? formatDateCo(d.reviewedAt) : '—',
      ])
    );

    const rejected = contract.deliverableItems.filter(
      d => d.status === DeliverableStatus.REJECTED
    );
    if (rejected.length > 0) {
      pdf.drawHighlightBox(
        'Entregables con observaciones',
        rejected
          .map(
            d =>
              `• ${d.title}: ${d.companyFeedback?.trim() || 'Sin comentario de la empresa registrado.'}`
          )
          .join('\n'),
        'warning'
      );
    }
  }

  pdf.drawSection('Evaluación de desempeño');
  if (companyRating) {
    pdf.drawParagraph(
      `Calificación de la empresa al candidato (promedio global: ${companyRating.overallScore.toFixed(1)}/5):`
    );
    pdf.drawRatingBars([
      { label: 'Calidad de entregables', score: companyRating.quality },
      { label: 'Cumplimiento de plazos', score: companyRating.deadlines },
      { label: 'Comunicación', score: companyRating.communication },
      { label: 'Actitud profesional', score: companyRating.attitude },
    ]);
    if (companyRating.comment?.trim()) {
      pdf.drawHighlightBox('Comentario de la empresa', companyRating.comment.trim(), 'info');
    }
  } else {
    pdf.drawParagraph(
      'La empresa no registró calificación al candidato. Se recomienda completarla en la plataforma para enriquecer el historial de reputación.'
    );
  }

  if (candidateRating) {
    pdf.drawParagraph(
      `Calificación del candidato a la empresa (${candidateRating.overallScore.toFixed(1)}/5):`
    );
    pdf.drawRatingBars([
      { label: 'Puntualidad de pagos', score: candidateRating.paymentPunctuality },
      { label: 'Claridad de instrucciones', score: candidateRating.instructionClarity },
      { label: 'Ambiente de trabajo', score: candidateRating.workEnvironment },
    ]);
    if (candidateRating.comment?.trim()) {
      pdf.drawHighlightBox('Comentario del candidato', candidateRating.comment.trim(), 'info');
    }
  }

  pdf.drawSection('Análisis de mercado (estimado)');
  pdf.drawKeyValueGrid([
    {
      label: 'Referencia estimada',
      value: formatMoneyCop(market.reference),
    },
    {
      label: 'Variación vs. referencia',
      value: `${market.variancePct >= 0 ? '+' : ''}${market.variancePct}%`,
    },
    { label: 'Área de la vacante', value: contract.job.area ?? 'General' },
  ]);
  pdf.drawParagraph(market.note);
  pdf.drawParagraph(
    'Nota: la referencia de mercado es un indicador orientativo basado en el área del proyecto y no sustituye una cotización formal ni estudios salariales externos.'
  );

  pdf.drawSection('Conclusiones y próximos pasos');
  pdf.drawHighlightBox(rec.title, rec.body, rec.variant);

  pdf.drawBulletList([
    'Archivar este reporte junto con comprobantes de pago y actas de aceptación de entregables.',
    'Usar las calificaciones mutuas para priorizar candidatos en futuras vacantes similares.',
    'Si hubo desviación de plazos, documentar causas y ajustar estimaciones en próximos contratos.',
    'Revisar el saldo pendiente (si existe) antes de considerar el proyecto totalmente cerrado operativamente.',
  ]);

  pdf.drawParagraph(
    'Este documento fue generado automáticamente por TalentBridge a partir de los registros del contrato, pagos, entregables y calificaciones en la plataforma. No constituye asesoría legal, contable ni laboral.',
    { color: TB.subtle }
  );
}

async function loadContractReportData(contractId: string, companyId: string) {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId },
    include: {
      candidate: {
        select: {
          fullName: true,
          career: { select: { name: true } },
          university: { select: { name: true } },
        },
      },
      company: { select: { companyName: true, sector: true, city: true } },
      job: { select: { title: true, area: true, duration: true, workMode: true, type: true } },
      payments: { orderBy: { sequence: 'asc' } },
      deliverableItems: { orderBy: { createdAt: 'asc' } },
      ratings: true,
    },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.COMPLETED) throw new Error('CONTRACT_NOT_COMPLETED');

  const totals = computePaymentTotals(contract.payments, contract.totalAmount);
  const companyRating = contract.ratings.find(r => r.raterRole === RatingRaterRole.COMPANY);
  const candidateRating = contract.ratings.find(r => r.raterRole === RatingRaterRole.CANDIDATE);

  const estimatedDays = daysBetween(contract.startDate, contract.endDate);
  const actualEnd = contract.completedAt ?? new Date();
  const actualDays = daysBetween(contract.startDate, actualEnd);
  const onTime = actualDays <= estimatedDays;
  const delivStats = deliverableCompletionRate(contract.deliverableItems);
  const market = marketBenchmark(contract.job.area, contract.totalAmount);
  const rec = hiringRecommendation(
    companyRating?.overallScore ?? null,
    candidateRating?.overallScore ?? null,
    onTime,
    delivStats.pct
  );

  return {
    contract,
    totals,
    companyRating,
    candidateRating,
    estimatedDays,
    actualDays,
    onTime,
    market,
    rec,
    delivStats,
  };
}

export async function generateContractReportPdf(
  userId: string,
  contractId: string
): Promise<Buffer> {
  const company = await getCompanyOrThrow(userId);
  const data = await loadContractReportData(contractId, company.id);
  return renderPdf(pdf => buildContractReport(pdf, data));
}
