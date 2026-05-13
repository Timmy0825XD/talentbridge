import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as applicationService from '../services/application.service';
import { ApplicationStatus } from '@prisma/client';

export async function applyToJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const jobId = req.params['id'] as string;
    const result = await applicationService.applyToJob(userId, jobId);

    res.status(201).json({
      message: '¡Te postulaste exitosamente!',
      application: {
        id:          result.id,
        status:      result.status,
        scoreAtApply: result.scoreAtApply,
        job:         result.job,
      },
      aiInsights: result.aiInsights,
    });
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    if (err.message === 'JOB_NOT_ACTIVE')
      return res.status(400).json({ error: 'Esta vacante no está disponible.' });
    if (err.message === 'CANDIDATE_PROFILE_NOT_FOUND')
      return res.status(400).json({ error: 'Debes completar tu perfil antes de postularte.' });
    if (err.message === 'ALREADY_APPLIED')
      return res.status(409).json({ error: 'Ya te postulaste a esta vacante.' });
    console.error('applyToJob error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getJobApplicants(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const jobId = req.params['id'] as string;
    const applicants = await applicationService.getJobApplicants(userId, jobId);
    res.json(applicants);
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    if (err.message === 'UNAUTHORIZED')
      return res.status(403).json({ error: 'No tienes permiso para ver esta información.' });
    console.error('getJobApplicants error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const applicationId = req.params['id'] as string;
    const { status } = req.body;

    if (!Object.values(ApplicationStatus).includes(status))
      return res.status(400).json({ error: 'Estado de postulación inválido.' });

    const application = await applicationService.updateApplicationStatus(
      userId,
      applicationId,
      status as ApplicationStatus
    );
    res.json(application);
  } catch (err: any) {
    if (err.message === 'APPLICATION_NOT_FOUND')
      return res.status(404).json({ error: 'Postulación no encontrada.' });
    if (err.message === 'UNAUTHORIZED')
      return res.status(403).json({ error: 'No tienes permiso para modificar esta postulación.' });
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getMyApplications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const applications = await applicationService.getMyApplications(userId);
    res.json(applications);
  } catch (err: any) {
    if (err.message === 'CANDIDATE_PROFILE_NOT_FOUND')
      return res.status(400).json({ error: 'No tienes un perfil de candidato.' });
    console.error('getMyApplications error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}