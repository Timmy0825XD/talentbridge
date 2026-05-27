import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { reportErrorMap } from '../lib/errors/error-maps/report.errors';
import * as reportService from '../services/report.service';

export const downloadContractReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pdf = await reportService.generateContractReportPdf(
    req.user!.userId,
    req.params['id'] as string
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="reporte_${req.params['id']}.pdf"`
  );
  res.send(pdf);
}, reportErrorMap, 'downloadContractReport');
