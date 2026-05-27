import PDFDocument from 'pdfkit';
import { ContractStatus, PaymentStatus, RatingRaterRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { computePaymentTotals } from '../lib/contract-helpers';
import { getCompanyOrThrow } from '../lib/access/profile-access';

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function marketBenchmark(area: string | null | undefined, totalAmount: number): string {
  const areaLower = (area ?? '').toLowerCase();
  let reference = totalAmount;
  if (areaLower.includes('desarrollo') || areaLower.includes('software')) {
    reference = Math.round(totalAmount * 1.15);
  } else if (areaLower.includes('diseño') || areaLower.includes('marketing')) {
    reference = Math.round(totalAmount * 1.08);
  } else {
    reference = Math.round(totalAmount * 1.05);
  }

  if (totalAmount <= reference * 0.95) return 'Por debajo del promedio estimado del mercado para este perfil.';
  if (totalAmount >= reference * 1.05) return 'Por encima del promedio estimado del mercado para este perfil.';
  return 'Alineado con el promedio estimado del mercado para este perfil.';
}

function hiringRecommendation(candidateScore: number | null, onTime: boolean): string {
  if (candidateScore !== null && candidateScore >= 4.5 && onTime) {
    return 'Recomendación: evaluar vinculación fija — desempeño y cumplimiento sobresalientes.';
  }
  if (candidateScore !== null && candidateScore >= 3.5) {
    return 'Recomendación: continuar contratando por proyecto — buen desempeño general.';
  }
  return 'Recomendación: definir plan de mejora antes de nuevos proyectos con este perfil.';
}

export async function generateContractReportPdf(
  userId: string,
  contractId: string
): Promise<Buffer> {
  const company = await getCompanyOrThrow(userId);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, companyId: company.id },
    include: {
      candidate: { select: { fullName: true, career: true } },
      company: { select: { companyName: true } },
      job: { select: { title: true, area: true, duration: true } },
      payments: true,
      ratings: true,
    },
  });

  if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  if (contract.status !== ContractStatus.COMPLETED) throw new Error('CONTRACT_NOT_COMPLETED');

  const totals = computePaymentTotals(contract.payments, contract.totalAmount);
  const companyRating = contract.ratings.find(r => r.raterRole === RatingRaterRole.COMPANY);

  const estimatedDays = daysBetween(contract.startDate, contract.endDate);
  const actualEnd = contract.completedAt ?? new Date();
  const actualDays = daysBetween(contract.startDate, actualEnd);
  const onTime = actualDays <= estimatedDays;

  const marketNote = marketBenchmark(contract.job.area, contract.totalAmount);
  const recommendation = hiringRecommendation(
    companyRating?.overallScore ?? null,
    onTime
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('TalentBridge — Reporte de Proyecto', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Contrato: ${contract.title}`);
    doc.text(`Empresa: ${contract.company.companyName ?? '—'}`);
    doc.text(`Candidato: ${contract.candidate.fullName ?? '—'} (${contract.candidate.career ?? '—'})`);
    doc.text(`Vacante: ${contract.job.title}`);
    doc.moveDown();

    doc.fontSize(14).text('Resumen financiero', { underline: true });
    doc.fontSize(11);
    doc.text(`Monto total acordado: $${contract.totalAmount.toLocaleString('es-CO')} COP`);
    doc.text(`Total pagado confirmado: $${totals.paidAmount.toLocaleString('es-CO')} COP`);
    doc.text(`Saldo pendiente: $${totals.remainingAmount.toLocaleString('es-CO')} COP`);
    doc.moveDown();

    doc.fontSize(14).text('Duración del proyecto', { underline: true });
    doc.fontSize(11);
    doc.text(`Periodo planificado: ${contract.startDate.toLocaleDateString('es-CO')} — ${contract.endDate.toLocaleDateString('es-CO')} (${estimatedDays} días)`);
    doc.text(`Cierre real: ${actualEnd.toLocaleDateString('es-CO')} (${actualDays} días)`);
    doc.text(onTime ? 'Cumplimiento de plazos: Sí' : 'Cumplimiento de plazos: No');
    if (contract.job.duration) doc.text(`Duración estimada en vacante: ${contract.job.duration}`);
    doc.moveDown();

    doc.fontSize(14).text('Calidad del desempeño', { underline: true });
    doc.fontSize(11);
    if (companyRating) {
      doc.text(`Calificación general al candidato: ${companyRating.overallScore.toFixed(1)} / 5`);
      doc.text(`Calidad de entregables: ${companyRating.quality ?? '—'}/5`);
      doc.text(`Cumplimiento de plazos: ${companyRating.deadlines ?? '—'}/5`);
      doc.text(`Comunicación: ${companyRating.communication ?? '—'}/5`);
      doc.text(`Actitud profesional: ${companyRating.attitude ?? '—'}/5`);
    } else {
      doc.text('Sin calificación registrada por la empresa.');
    }
    doc.moveDown();

    doc.fontSize(14).text('Análisis de mercado (estimado)', { underline: true });
    doc.fontSize(11).text(marketNote);
    doc.moveDown();

    doc.fontSize(14).text('Recomendación', { underline: true });
    doc.fontSize(11).text(recommendation);
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666666').text(
      'Documento informativo generado por TalentBridge. No constituye asesoría legal ni financiera.',
      { align: 'center' }
    );

    doc.end();
  });
}
